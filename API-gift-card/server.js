const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const TAP_BEARER_TOKEN = process.env.TAP_BEARER_TOKEN;


app.use(express.json());
app.use(cors());

// معالجة الدفع
app.post("/process-payment", async (req, res) => {
  const { token } = req.body;


  console.log(` 
      
      data for need =>>>>>>>>>>>

      req.body.data => => => 

      `);

  // console.log(req.body.data);


  if (!token) {
    return res.status(400).json({ message: "Source ID is required" });
  }


  try {
    const response = await axios.post(
      "https://api.tap.company/v2/charges",
      {
        amount: 0.10,
        currency: "SAR",
        customer: {
          first_name: "jamal aziz",
          email: "jbahoum@cleanlife.sa",
          phone: {
            country_code: "966",
            number: "512345678",
          },
        },
        source: {
          id: token, // استخدام الـ Source ID المرسل من الواجهة الأمامية
        },
        redirect: {
          url: "http://localhost:3000/ar/giftcard/PaymentConfirmation",
          data: req?.body?.data
        },
      },
      {
        headers: {
          Authorization: `Bearer ${TAP_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.transaction && response.data.transaction.url) {
      // console.log(response.data);

      return res.status(200).json({
        message: "Transaction initiated",
        redirect_url: response.data.transaction.url,
      });
    } else {
      return res.status(400).json({ message: "Transaction not initiated properly" });
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "An error occurred during the payment process!",
      error: error.response?.data || error.message,
    });
  }
});





// =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   test Zoho =>>>>>>>>>>>>>>>>>>>>>>>>>>>


// Access Token الحالي
let accessToken = '';
const refreshToken = '1000.8600afcc6f3d2fac8803cd41c792239b.93f549527c2dc0085a305a3d14a02bfd'; // ضع Refresh Token الخاص بك
const clientId = '1000.0P3DQRDN0D47YBCJI2J4NP6TO6F07U'; // Client ID الخاص بك
const clientSecret = '6b2cb297c922265e1fa27c5ca0af19a1de7ac5472e'; // Client Secret الخاص بك

// Function to refresh Access Token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.access_token) {
      accessToken = response.data.access_token; // Update Access Token
      console.log('Access Token refreshed:', accessToken);
      return accessToken;
    } else {
      throw new Error(`Failed to refresh Access Token: ${response.data.error_description || 'Unknown error'}`);
    }
  } catch (error) {
    throw new Error(`Error refreshing Access Token: ${error.message}`);
  }
};


const addRecord = async (data) => {
  let token;

  try {
    // احصل على التوكن
    token = await refreshAccessToken(); // تأكد من استخدام await
    if (!token) {
      throw new Error("Failed to retrieve access token");
    }

    // إرسال الطلب إلى Zoho API
    const response = await fetch(`https://www.zohoapis.com/creator/v2.1/data/atoolco/test-app/form/Test_Pey_API`, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data }),
    });

    // التحقق من حالة الاستجابة
    if (response.status === 401) {
      console.log('Access Token expired. Refreshing...');
      token = await refreshAccessToken(); // حاول تجديد التوكن
      return addRecord(data); // إعادة المحاولة
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error Response Data:", errorData);
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }

    // استرجاع بيانات الاستجابة
    return await response.json();
  } catch (error) {
    if (error.response) {
      console.error("Error Response Status:", error.response.status);
      const errorData = await error.response.json();
      console.error("Error Response Data:", errorData);
      throw new Error(`API Error: ${errorData.message || error.message}`);
    }
    throw new Error(`API Error: ${error.message}`);
  }
};


// بيانات السجل الجديد
// const data = [
//   {
//     Currency1: "500",
//     PhoneSender: "+966564324552",
//     Phone_Number: "+966564324552",
//     NameSender: {
//       prefix: "",
//       last_name: "Doe",
//       suffix: "",
//       first_name: "John",
//       zc_display_value: "John Doe", // القيمة المعروضة
//     },
//     ID: "4270539000056213085",
//     Name: {
//       prefix: "",
//       last_name: "Smith",
//       suffix: "",
//       first_name: "Jane",
//       zc_display_value: "Jane Smith", // القيمة المعروضة
//     },
//   },
// ];


// استدعاء الدالة
// addRecord(data)
//   .then((response) => {
//     console.log("Record added successfully:", response);
//   })
//   .catch((error) => {
//     console.error("Error adding record:", error.message);
//   });







// Function to make API Request


// https://www.zohoapis.com/creator/v2.1/data/atoolco/test-app/report/Test_Pey_API_Report ????? =>>  postman ok success 

// =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   test Zoho stop =>>>>>>>>>>>>>>>>>>>>>>>>>>>




const findDataZoho = (tapId) => {
  const makeApiRequest = async (path) => {
    console.log(`
      makeApiRequest
      => 
          => 
              =>
      `);

    console.log(`https://www.zohoapis.com${path}`);

    try {

      const response = await fetch(`https://www.zohoapis.com${path}`, {
        method: "GET",
        headers: {
          "Authorization": `Zoho-oauthtoken ${accessToken}`,
        },
      });



      return response?.json();;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Access Token expired, refresh it
        console.log('Access Token expired. Refreshing...');
        await refreshAccessToken();
        return makeApiRequest(path); // Retry the request
      } else {
        throw new Error(`API Error: ${error.message}`);
      }
    }
  };


  // Example API Request
  return (async () => {
    try {
      if (!accessToken) {
        console.log('Refreshing Access Token...');
        await refreshAccessToken();
      }

      // إعداد أسماء التطبيق والتقرير
      const accountOwnerName = 'atoolco'; // Account Owner Name
      const appLinkName = 'test-app'; // App Link Name
      const reportLinkName = 'Test_Pey_API_Report'; // Report Link Name
      const URL = "www.zohoapis.com"
      // URL النهائي
      // const apiUrl = `/creator/v2.1/data/${accountOwnerName}/${appLinkName}/report/${reportLinkName}`;
      const test = `/creator/v2.1/data/${accountOwnerName}/${appLinkName}/report/${reportLinkName}`
      // إرسال الطلب
      console.log(`Generated URL: https://www.zohoapis.com/creator/v2.1/data/${accountOwnerName}/${appLinkName}/report/${reportLinkName}`);

      const response = await makeApiRequest(test);
      console.log('API Response:', response.data);


      const dataZohoFind = response?.data?.find((elm, index) => {
        return elm.tapID == tapId
      })
      console.log("dataZohoFind => ");


      console.log(dataZohoFind?.tapID);

      return dataZohoFind



    } catch (error) {
      console.error('Error:', error.message);
    }
  })();
}





















app.get("/check-payment/:id", async (req, res) => {









  console.log(req.params);

  const rawData = req.params.id;

  // تقسيم السلسلة إلى tapId و dataGiftdata
  const params = new URLSearchParams(rawData);

  const tapId = params.get("tapId");
  const dataGiftdata = params.get("dataGiftdata");
  const parsedDataGiftdata = JSON.parse(dataGiftdata);
  console.log(parsedDataGiftdata);

  if (tapId) {

    const zohoDataFindIDTAP = await findDataZoho(tapId)

    console.log("zohoDataFindIDTAP");

    console.log(zohoDataFindIDTAP);

    if (zohoDataFindIDTAP?.tapID == tapId & zohoDataFindIDTAP?.Single_Line1 == "CAPTURED") {
      res.status(200).json({
        status: false,
        details: "Already exists in Zoho, and the operation is successful",
      });
      console.log("Already exists in Zoho, and the operation is successful");


      return
    }
  }



  try {
    const response = await axios.get(`https://api.tap.company/v2/charges/${tapId}`, {
      headers: {
        Authorization: `Bearer ${TAP_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log(" =>>>>>>>>>>>>> res payment CAPTURED data ");
    console.log(response);









    if (response?.data && parsedDataGiftdata && tapId) {


      const zohoDataFindIDTAP = await findDataZoho(tapId)

      console.log("zohoDataFindIDTAP");

      console.log(zohoDataFindIDTAP);

      if (zohoDataFindIDTAP?.tapID == tapId & zohoDataFindIDTAP?.Single_Line1 == "CAPTURED") {
        res.status(200).json({
          status: response?.data.status,
          details: response?.data,
        });
        console.log("Already exists in Zoho, and the operation is successful");


        return
      } else {
        const data = [
          {
            tapID: tapId,
            Currency1: parsedDataGiftdata.priceSelected,
            PhoneSender: parsedDataGiftdata?.dataSenderNumber,
            Phone_Number: parsedDataGiftdata?.dataRecipientNumber,
            NameSender: {
              prefix: "",
              last_name: "",
              suffix: "",
              first_name: parsedDataGiftdata?.dataSenderName,
              zc_display_value: parsedDataGiftdata?.dataSenderName, // القيمة المعروضة
            },
            Name: {
              prefix: "",
              last_name: "Smith",
              suffix: "",
              first_name: parsedDataGiftdata.dataRecipientName,
              zc_display_value: parsedDataGiftdata.dataRecipientName, // القيمة المعروضة
            },
            Single_Line1: response?.data?.status,
            Single_Line2: parsedDataGiftdata?.MessageSend || "لا يوجد",
            Single_Line3: parsedDataGiftdata?.citiesFormatted || "لا يوجد",
            Single_Line4: parsedDataGiftdata?.TimeFormatted,
            Single_Line5: parsedDataGiftdata?.DateFormatted,
          },
        ];



        addRecord(data)
          .then((response) => {
            console.log("Record added successfully:", response);
          })
          .catch((error) => {
            console.error("Error adding record:", error.message);
          });
        console.log("create in zoho creator successful");
      }



    }
    // إرسال حالة الدفع للعميل
    res.status(200).json({
      status: response.data.status,
      details: response.data,
    });
  } catch (error) {
    console.error("Error fetching payment status:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to fetch payment status",
      error: error.response?.data || error.message,
    });
  }
});








// بدء تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

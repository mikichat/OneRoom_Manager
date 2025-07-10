const { Notification, Contract } = require('../models');
const axios = require('axios');
const crypto = require('crypto');

// Naver Cloud Platform SENS configuration
const SENS_ACCESS_KEY = process.env.SENS_ACCESS_KEY;
const SENS_SECRET_KEY = process.env.SENS_SECRET_KEY;
const SENS_SERVICE_ID = process.env.SENS_SERVICE_ID;
const SENS_CALLER_NUMBER = process.env.SENS_CALLER_NUMBER;

const makeSignature = (method, url, timestamp, accessKey, secretKey) => {
  const space = " ";
  const newLine = "\n";
  const hmac = crypto.createHmac('sha256', secretKey);
  const message = method + space + url + newLine + timestamp + newLine + accessKey;
  hmac.update(message);
  return hmac.digest('base64');
};

exports.sendSms = async (req, res) => {
  try {
    const { contract_id, content } = req.body;
    const contract = await Contract.findByPk(contract_id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // For simplicity, assuming tenant phone is available via contract
    const tenant = await contract.getTenant(); // Assuming association is set up
    if (!tenant || !tenant.phone) {
      return res.status(400).json({ message: 'Tenant phone number not found for this contract' });
    }

    const timestamp = Date.now().toString();
    const method = 'POST';
    const url = `/sms/v2/services/${SENS_SERVICE_ID}/messages`;
    const signature = makeSignature(method, url, timestamp, SENS_ACCESS_KEY, SENS_SECRET_KEY);

    const body = {
      type: 'SMS',
      contentType: 'COMM',
      countryCode: '82',
      from: SENS_CALLER_NUMBER,
      content: content,
      messages: [
        {
          to: tenant.phone,
          content: content
        }
      ]
    };

    const response = await axios({
      method: method,
      url: `https://sens.apigw.ntruss.com${url}`,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': SENS_ACCESS_KEY,
        'x-ncp-apigw-signature-v2': signature
      },
      data: body
    });

    await Notification.create({
      contract_id,
      type: 'SMS',
      title: 'SMS 발송',
      content,
      sent_at: new Date(),
      status: '발송완료'
    });

    res.status(200).json({ message: 'SMS sent successfully', data: response.data });
  } catch (error) {
    console.error('SMS send error:', error.response ? error.response.data : error.message);
    await Notification.create({
      contract_id: req.body.contract_id,
      type: 'SMS',
      title: 'SMS 발송 실패',
      content: req.body.content,
      sent_at: new Date(),
      status: '실패'
    });
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [{ model: Contract, as: 'contract' }]
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
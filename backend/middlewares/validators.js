const { body, param, query } = require('express-validator');

// Auth validators
const registerValidator = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3 })
    .withMessage('用户名은 3자 이상이어야 합니다.'),
  body('password')
    .isString()
    .trim()
    .isLength({ min: 6 })
    .withMessage('비밀번호는 6자 이상이어야 합니다.'),
];

const loginValidator = [
  body('username').isString().trim().notEmpty().withMessage('用户名은 필수입니다.'),
  body('password').isString().trim().notEmpty().withMessage('비밀번호는 필수입니다.'),
];

// Tenant validators
const tenantValidators = [
  body('name').isString().trim().notEmpty().withMessage('이름은 필수입니다.'),
  body('phone').isString().trim().notEmpty().withMessage('전화번호는 필수입니다.'),
  body('email').isEmail().optional().withMessage('유효한 이메일을 입력해주세요.'),
  body('birth_first_six').isLength({ min: 6, max: 6 }).optional().withMessage('생년월일은 6자리여야 합니다.'),
  body('emergency_contact').isString().trim().optional(),
  body('emergency_name').isString().trim().optional(),
  body('is_student').isBoolean().optional(),
  body('school_name').isString().trim().optional(),
];

// Contract validators
const contractValidators = [
  body('room_id').isInt().withMessage('유효한 호실 ID가 필요합니다.'),
  body('tenant_id').isInt().withMessage('유효한 임차인 ID가 필요합니다.'),
  body('contract_start_date').isISO8601().withMessage('유효한 시작일자가 필요합니다.'),
  body('contract_end_date').isISO8601().withMessage('유효한 종료일자가 필요합니다.'),
  body('monthly_rent').isNumeric().withMessage('월세는 숫자여야 합니다.'),
  body('deposit').isNumeric().optional(),
  body('contract_status').isString().optional(),
  body('special_terms').isString().optional(),
];

// Building validators
const buildingValidators = [
  body('name').isString().trim().notEmpty().withMessage('건물 이름은 필수입니다.'),
  body('address').isString().trim().notEmpty().withMessage('주소는 필수입니다.'),
  body('total_floors').isInt({ min: 1 }).withMessage('총 층 수는 1 이상이어야 합니다.'),
];

// Room validators
const roomValidators = [
  body('building_id').isInt().withMessage('유효한 건물 ID가 필요합니다.'),
  body('room_number').isString().trim().notEmpty().withMessage('호실 번호는 필수입니다.'),
  body('floor').isInt({ min: -1 }).withMessage('유효한 층 수가 필요합니다.'),
  body('room_type').isString().trim().notEmpty().withMessage('호실 유형은 필수입니다.'),
  body('area').isNumeric().optional(),
  body('monthly_rent').isNumeric().withMessage('월세는 숫자여야 합니다.'),
  body('deposit').isNumeric().optional(),
  body('status').isString().optional(),
  body('description').isString().optional(),
];

// Rent payment validators
const rentPaymentValidators = [
  body('contract_id').isInt().withMessage('유효한 계약 ID가 필요합니다.'),
  body('payment_date').isISO8601().optional(),
  body('amount').isNumeric().withMessage('금액은 숫자여야 합니다.'),
  body('payment_method').isString().optional(),
  body('payment_status').isString().optional(),
  body('due_date').isISO8601().optional(),
  body('memo').isString().optional(),
];

module.exports = {
  registerValidator,
  loginValidator,
  tenantValidators,
  contractValidators,
  buildingValidators,
  roomValidators,
  rentPaymentValidators,
};

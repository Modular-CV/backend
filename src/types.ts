export enum ErrorCodes {
  'AUTH-001' = 'Authorization header is required',
  'AUTH-002' = 'Auth token is required',
  'AUTH-003' = 'Auth token is invalid',
  'AUTH-004' = 'Invalid email or password',
  'VAL-001' = 'Request body is missing required fields or is invalid',
  'ACC-001' = 'Email is already registered',
  'ACC-002' = 'Email could not be sent',
  'VER-001' = 'Verification token is invalid, expired or used',
}


const RoleTypes = Object.freeze({
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  B2B_USER: 'B2BUser',
  B2C_USER: 'B2CUser',
});

const UserStatus = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
});

export const FileUploadStatusType = Object.freeze({
  UPLOADING: 'Uploading',
  UPLOADED: 'Uploaded',
});

const QrCodeStatus = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

const ProductType = Object.freeze({
  B2B_PRODUCT: 'B2BProduct',
  B2C_PRODUCT: 'B2CProduct',
});

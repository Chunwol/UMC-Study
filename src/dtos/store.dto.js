export const bodyToStore = (body, files) => {
  const storeHours = body.storeHours ? JSON.parse(body.storeHours) : [];

  return {
    name: body.name.trim(),
    addressDetail: body.addressDetail?.trim(),
    addressCode: body.addressCode,
    industry: body.industry?.trim(),
    storeHours,
    files: files || [] 
  };
};
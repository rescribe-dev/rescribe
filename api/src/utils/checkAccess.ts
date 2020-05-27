import Access, { AccessLevel } from '../schema/auth/access';
import { ObjectId } from 'mongodb';

export const checkAccess = (targetID: ObjectId, accessArray: Access[], requiredLevel: AccessLevel): boolean => {
  const accessIndex = accessArray.findIndex(access => access._id.equals(targetID));
  if (accessIndex < 0) {
    return false;
  }
  const access = accessArray[accessIndex];
  switch (requiredLevel) {
    case AccessLevel.view:
      return true;
    case AccessLevel.edit:
      return [AccessLevel.owner, AccessLevel.admin, AccessLevel.edit].includes(access.level);
    case AccessLevel.admin:
      return [AccessLevel.owner, AccessLevel.admin].includes(access.level);
    case AccessLevel.owner:
      return access.level === AccessLevel.owner;
  }
};

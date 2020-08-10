import Access, { AccessLevel } from '../schema/users/access';
import { ObjectId } from 'mongodb';

export const checkAccessLevel = (givenLevel: AccessLevel, requiredLevel: AccessLevel): boolean => {
  switch (requiredLevel) {
    case AccessLevel.none:
      return givenLevel === AccessLevel.none;
    case AccessLevel.view:
      return [AccessLevel.owner, AccessLevel.admin, AccessLevel.edit, AccessLevel.view].includes(givenLevel);
    case AccessLevel.edit:
      return [AccessLevel.owner, AccessLevel.admin, AccessLevel.edit].includes(givenLevel);
    case AccessLevel.admin:
      return [AccessLevel.owner, AccessLevel.admin].includes(givenLevel);
    case AccessLevel.owner:
      return givenLevel === AccessLevel.owner;
  }
};

export const checkAccess = (targetID: ObjectId, accessArray: Access[], requiredLevel: AccessLevel): boolean => {
  const accessIndex = accessArray.findIndex(access => access._id.equals(targetID));
  if (accessIndex < 0) {
    return false;
  }
  const access = accessArray[accessIndex];
  return checkAccessLevel(access.level, requiredLevel);
};

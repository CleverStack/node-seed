module.exports  = function normalizeFindOptions(findOptions) {
  findOptions   = findOptions || { where: {} };
  if (!findOptions.where) {
    findOptions = {where: findOptions};
  }
  return findOptions;
};
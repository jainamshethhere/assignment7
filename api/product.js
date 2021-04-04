const { getDb, getNextSequence } = require('./db.js');

/**
 * Fetches all products from database.
 * @returns List of products
 */
async function list() {
  const db = getDb();
  const products = await db.collection('products').find({}).toArray();
  return products;
}

/**
 * Adds the new product to the databse. Accepts an object with Product as the second parameter.
 * @returns Currently added product
 */
async function add(_, { product }) {
  const db = getDb();
  // eslint-disable-next-line no-param-reassign
  product.id = await getNextSequence('products');

  const result = await db.collection('products').insertOne(product);
  const currentlyAddedProduct = await db
    .collection('products')
    .findOne({ _id: result.insertedId });
  return currentlyAddedProduct;
}

module.exports = { list, add };

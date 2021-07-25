const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

exports.main = async (event, context) => {
  const city = event.city;
  console.log(city)
  const { data: companies } = await db.collection('companies').where({
    city
  }).get()
  return companies
}
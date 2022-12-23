const { count } = require("../schema/user.schema");
const User = require("../schema/user.schema");
const  getPagination = (totalDocs,page,limit) => {
  let total =totalDocs/limit 
  let prevPage = null;
  let hasPrevPage = false;
  let nextPage = null;
let hasNextPage = false;
  let totalPages = total - Math.floor(total)>0?Math.floor(total)+1:Math.floor(total);
  let pagingCounter = limit *(page-1) +1 >0 ? limit *(page-1) +1:1;
  if(page-1 >= totalPages){
    hasPrevPage = true;
    prevPage =page-1;
  }
  if(page+1 < totalPages){
    hasNextPage=true;
    nextPage=page+1;
  }
 
  let   pagination ={
  "totalDocs": totalDocs,
            "limit": limit,
            "page": page,
            "totalPages": totalPages,
            "pagingCounter": pagingCounter,
            "hasPrevPage": hasPrevPage,
            "hasNextPage":hasNextPage ,
            "prevPage": prevPage,
            "nextPage":  nextPage
  }
console.log(pagination)
return pagination
}
module.exports.getUsersWithPostCount = async (req, res) => {
  try {
    //TODO: Implement this API
    const getUsers = await User.find();
    
    const page =parseInt(req.query.page)?parseInt(req.query.page):0;   
    const limit=parseInt(req.query.limit) ? parseInt(req.query.limit):10;
    
   
    
    let test = await User.aggregate(
      [
        {
          '$lookup': {
            'from': 'posts', 
            'localField': '_id', 
            'foreignField': 'userId', 
            'as': 'post'
          }
        }, {
          '$project': {
            'name': '$name', 
            'posts': {
              '$size': '$post'
            }
          }
        }, {
          '$facet': {
            'data': [
              {
                '$skip': page*limit
              }, {
                '$limit': limit
              }
            ], 
            'pagination': [
              {
                '$count': 'totalDocs'
              }
            ]
          }
        }, {
          '$unwind': {
            'path': '$pagination', 
            'preserveNullAndEmptyArrays': true
          }
        }
      ]
    )
    
console.log(test)
console.log("test")
    test = test[0];   
    let totalDocs =test.pagination.totalDocs;  
 
      let  details ={
        data:{
          users: test.data,
        pagination : getPagination(totalDocs,page,limit),
        }
      }
      
    res.status(200).json(details);
  } catch (error) {
    res.send({ error: error.message });
  }
};

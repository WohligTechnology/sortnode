var mongoose = require('mongoose');
var md5 = require('MD5');
var Schema = mongoose.Schema;

var schema = new Schema({
  name: String,
  email: String,
  password: String,
  mobile: String,
  forVerification:{
    type:Boolean,
    default:false
  },
  nominee: [{
    name: {
      type: String,
      default: ""
    },
    guardianName: {
      type: String,
      default: ""
    },
    guardianPan: {
      type: String,
      default: ""
    },
    dob: {
      type: Date,
      default: ""
    },
    relationship: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    country: {
      type: String,
      default: ""
    },
    pincode: {
      type: String,
      default: ""
    },
  }],
  dob: {
    type: Date,
    default: Date.now
  },
  placeofbirth:{
    type: String,
    default: ""
  },
  country: {
    type: String,
    default: ""
  },
  grossAnnualIncome: {
    type: String,
    default: ""
  },
  networth: {
    type: Number,
    default: 0
  },
  occupation: {
    type: String,
    default: ""
  },
  gender: {
    type: String,
    default: ""
  },
  politicalViews: {
    type: String,
    default: ""
  },
  taxResidency: {
    type: String,
    default: ""
  },
  maritalStatus: {
    type: String,
    default: ""
  },
  nationality: {
    type: String,
    default: ""
  },
  taxStatus: {
    type: String,
    default: ""
  },
  documents: {
    photo: {
      type: String,
      default: ""
    },
    addressproof: {
      type: String,
      default: ""
    },
    corraddressproof: {
      type: String,
      default: ""
    },
    addresstype: {
      type: String,
      default: ""
    },
    bankname: {
      type: String,
      default: ""
    },
    pan: {
      type: String,
      default: ""
    },
    cancelledcheque: {
      type: String,
      default: ""
    }
  },
  portfolios: [String],
  referralCode: {
    type: String,
    default: ""
  },
  points: {
    type: Number,
    default: ""
  },
  referred: {
    type: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    index: true
  },
  notification: [{
    title: {
      type: String,
      default: ""
    },
    body: {
      type: String,
      default: ""
    }
  }]
});

module.exports = mongoose.model('User', schema);
var models = {
  saveData: function(data, callback) {
    if (data.password && data.password !== "") {
      data.password = md5(data.password);
    }
    var user = this(data);
    console.log(data);
    user.timestamp = new Date();
    this.count({
      mobile: data.mobile,
      email:data.email
    }, function(err, found) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        // callback(null, data2);
        if (found === 0) {
          User.findOne({
            mobile: data.referralCode
          }, function(err, found) {
            if (err) {
              console.log(err);
            } else {
              if (_.isEmpty(found)) {
                callback(null, {
                  message: "Invalid referralCode"
                });
              } else {
                console.log("found", found);

                user.save(function(err, data2) {
                  if (err) {
                    console.log(err);
                    callback(err, null);
                  } else {
                    User.update({
                      mobile: data.referralCode
                    }, {
                      $push: {
                        referred: {
                          name: data2.name,
                          user: data2._id
                        }
                      },
                      $inc:{
                        points:2000
                      }
                    }, function(err, saveres) {
                      if (err) {
                        console.log(err);
                        callback(err, null);
                      } else {
                        // console.log(saveres);
                        callback(null, data2);
                      }
                    });
                    // callback(null, data2);
                  }
                });
              }
            }
          });

        } else {
          callback(null, {
            message: "User already exists"
          });
        }
      }
    });
  },
    saveAsIs: function(data, callback) {
      console.log("saveAsIs",data);
      var user = this(data);
      user.timestamp = new Date();
      if (data._id) {
        this.findOneAndUpdate({
          _id: data._id
        }, data).exec(function(err, updated) {
          if (err) {
            console.log(err);
            callback(err, null);
          } else if (updated) {
            callback(null, updated);
          } else {
            callback(null, {});
          }
        });
      } else {
        user.save(function(err, created) {
          if (err) {
            callback(err, null);
          } else if (created) {
            callback(null, created);
          } else {
            callback(null, {});
          }
        });
      }
    },
  deleteData: function(data, callback) {
    this.findOneAndRemove({
      _id: data._id
    }, function(err, deleted) {
      if (err) {
        callback(err, null);
      } else if (deleted) {
        callback(null, deleted);
      } else {
        callback(null, {});
      }
    });
  },
  getAll: function(data, callback) {
    this.find({}).exec(function(err, found) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (found && found.length > 0) {


        _.each(found, function(n) {
          console.log("In loop");
          n.type = "user";
        });
        callback(null, found);
      } else {
        callback(null, []);
      }
    });
  },
  getAllNominee: function(data, callback) {
    this.findOne({
      _id: data._id
    }, {
      nominee: 1,
      _id: 1
    }).lean().exec(function(err, found) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (_.isEmpty(found)) {
        callback(null, {});

      } else {
        found.user = found._id;
        callback(null, found);
      }
    });
  },
  getOne: function(data, callback) {
    this.findOne({
      "_id": data._id
    }).exec(function(err, found) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else if (found && Object.keys(found).length > 0) {

        callback(null, found);
      } else {
        callback(null, {});
      }
    });
  },

  login: function(data, callback) {
    this.findOne({
      email: data.email,
      password: md5(data.password)
    }).lean().exec(function(err, found) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        if (_.isEmpty(found)) {
          callback(null, {});
        } else {
          delete found.password;
          callback(null, found);
        }
      }
    });
  },
  editProfile: function(data, callback) {
    delete data.password;
    data.modificationDate = new Date();
    this.findOneAndUpdate({
      _id: data._id
    }, data, function(err, data2) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        // callback(null, data);
        User.getSession(data, function(err, data3) {
          if (err) {
            console.log(err);
            callback(err, null);
          } else {
            callback(null, data3);
          }
        });
      }
    });
  },
  getSession: function(data, callback) {
    User.findOne({
      _id: data._id
    }).populate("referred.user", "name email", null, { sort: { "name": 1 } }).lean().exec(function(err, res) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, res);
      }
    });
  },
  findLimited: function(data, callback) {
    var newreturns = {};
    newreturns.data = [];
    var check = new RegExp(data.search, "i");
    data.pagenumber = parseInt(data.pagenumber);
    data.pagesize = parseInt(data.pagesize);
    async.parallel([
        function(callback) {
          User.count({
            occupation: {
              '$regex': check
            }
          }).exec(function(err, number) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else if (number && number !== "") {
              newreturns.total = number;
              newreturns.totalpages = Math.ceil(number / data.pagesize);
              callback(null, newreturns);
            } else {
              callback(null, newreturns);
            }
          });
        },
        function(callback) {
          User.find({
            occupation: {
              '$regex': check
            }
          }).skip(data.pagesize * (data.pagenumber - 1)).limit(data.pagesize).exec(function(err, data2) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else if (data2 && data2.length > 0) {
              newreturns.data = data2;
              callback(null, newreturns);
            } else {
              callback(null, newreturns);
            }
          });
        }
      ],
      function(err, data4) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else if (data4) {
          callback(null, newreturns);
        } else {
          callback(null, newreturns);
        }
      });
  }
};

module.exports = _.assign(module.exports, models);

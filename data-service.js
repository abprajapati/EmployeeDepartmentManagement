
const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "d66rtpejm6nf99",
  "wxabtkzvarnkfl",
  "50713c0c707a300ddd72ebeed0c5d9d574b585441360478e23a47dd7c75bd906",
  {
    host: "ec2-3-209-38-221.compute-1.amazonaws.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },

    query: { raw: true },
  }
);

sequelize
  .authenticate()
  .then(function () {
    console.log("connection has been done sucessfully!");
  })
  .catch(function (err) {
    console.log("can not connect with the database:", err);
  });

var Employee = sequelize.define(
  "Employee",
  {
    employeeNum: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING,
    department: Sequelize.INTEGER,
  },

  {
    createdAt: false,
    updatedAt: false,
  }
);

var Department = sequelize.define(
  "Department",
  {
    departmentId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    departmentName: Sequelize.STRING,
  },

  {
    createdAt: false,
    updatedAt: false,
  }
);

Department.hasMany(Employee, { foreignKey: "department" });


module.exports.initialize = function () {

    return new Promise(function (resolve, reject) 
    {
        sequelize.sync()
          .then(function () 
          {
            console.log("sucessfully, connection has been done!");
            resolve();
          })
          .catch(function (errOrMassage) 
          {
            reject("unable to sync the database");
          });
      });
};


module.exports.getAllEmployees = function () {

    return new Promise(function (resolve, reject) 
    {
        Employee.findAll()
          .then(function(data)
          {
            resolve(data);
          })
          .catch(function(errorMassage) 
          {
            reject("no results returned");
          });
      });
};


module.exports.getDepartments = function () 
{
    return new Promise(function(resolve, reject)  
    {
        Department.findAll()
          .then(function(data) 
          {
            resolve(data);
          })
          .catch(function(err) 
          {
            reject("no results returned");
          });
      });
};

module.exports.addEmployee = function (employeeData) 
   {
    employeeData.isManager = employeeData.isManager ? true : false;

  for (let i in employeeData) 
  {
    if (employeeData[i] == "") 
    {
      employeeData[i] = null;
    }
  }

  return new Promise(function(resolve, reject) 
  {
    Employee.create(employeeData)
      .then(function(data) 
      {
        resolve(data);
      })
      .catch(function(errorMessage)  
      {
        reject("unable to create employee");
      });
  }); 
};

module.exports.getEmployeeByNum = function (num) 
{
    
    return new Promise(function(resolve, reject)  
    {
        Employee.findAll({
          where: 
          {
            employeeNum: num,
          },
        })
          .then(function(data) 
          {
            resolve(data[0]);
          })
          .catch(function(errorMessage) 
          {
            reject("no results returned");
          });
      });
  
  };
  

  
  module.exports.getEmployeesByStatus = function (status) 
     {
     
      return new Promise(function(resolve, reject)  
      {
    Employee.findAll({
      where: 
      {
        status: status,
      },
    })
      .then(function(data) 
      {
        resolve(data);
      })
      .catch(function(errorMessage) 
      {
        reject("no results returned");
      });
  });
  
  };
  
  module.exports.getEmployeesByDepartment = function (department) 
     {
  
        return new Promise(function(resolve, reject)  
        {
            Employee.findAll({
              where: 
              {
                department: department,
              },
            })
              .then(function(data) 
              {
                resolve(data);
              })
              .catch(function(errorMessage)  
              {
                reject("no results returned");
              });
          });
  
  };
 
  module.exports.getEmployeesByManager = function (boolMan) 
     {
     
        return new Promise(function(resolve, reject)  
        {
            Employee.findAll({
              where: 
              {
                employeeManagerNum: manager,
              },
            })
              .then(function(data) 
              {
                resolve(data);
              })
              .catch(function(errorMessage)  
              {
                reject("no results returned");
              });
          });
  };

module.exports.updateEmployee = function (employeeData) 
{

    employeeData.isManager = employeeData.isManager ? true : false;

    for (let i in employeeData) 
    {
      if (employeeData[i] == "") 
      {
        employeeData[i] = null;
      }
    }
  
    return new Promise(function(resolve, reject)  
    {
      Employee.update(
          employeeData,
        {
          where: {
            employeeNum: employeeData.employeeNum,
          },
        }
      )
        .then(function(data)  
        {
          resolve();
        })
        .catch((errorMessage) => 
        {
          reject("unable to update employee");
        });
    });
};


module.exports.deleteEmployeeByNum = function(empNum) 
  {
    return new Promise(function(resolve, reject)  
    {
      Employee.destroy({
        where: 
        {
          employeeNum: empNum,
        },
      })
        .then(function(data)  
        {
          resolve();
        })
        .catch(function(errorMassage) 
        {
          reject("was rejected");
        });
    });
  };

module.exports.addDepartment = function (departmentData) 
{
    for (let i in departmentData) 
    {
      if (departmentData[i] == "") 
      {
        departmentData[i] = null;
      }
    }
  
    return new Promise(function(resolve, reject)  
    {
      Department.create({
        departmentName: departmentData.departmentName,
      })
        .then(function(data)  
        {
          resolve();
        })
        .catch(function(errorMassage)  
        {
          reject("unable to create department");
        });
    });
  };

  module.exports.getDepartmentById = function (id) 
  {
    return new Promise(function(resolve, reject)  
    {
      Department.findAll({
        where: 
        {
          departmentId: id,
        },
      })
        .then(function(data)  
        {
          resolve(data);
        })
        .catch(function(errorMessage) 
        {
          reject("no results returned");
        });
    });
  };
  
module.exports.updateDepartment = function (departmentData) 
{
    for (let i in departmentData) 
    {
      if (departmentData[i] == "") 
      {
        departmentData[i] = null;
      }
    }
  
    return new Promise(function(resolve, reject) 
    {
      Department.update(
        {
          departmentName: departmentData.departmentName,
        },
        {
          where: 
          {
            departmentId: departmentData.departmentId,
          },
        }
      )
        .then(function(data)  
        {
          resolve();
        })
        .catch(function(errorMessage)  
        {
          reject("unable to update department");
        });
    });
  };

 

  module.exports.deleteDepartmentById = function(id) 
  {
    return new Promise(function(resolve, reject)  
    {
      Department.destroy({
        where: 
        {
          departmentId: id,
        },
      })
        .then(function(data)  
        {
          resolve();
        })
        .catch(function(errorMessage) 
        {
          reject("was rejected");
        });
    });
  };




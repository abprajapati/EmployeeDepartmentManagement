
var express = require("express");
var multer = require("multer");
var path = require("path");
var dataSrv = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const clientSessions = require("client-sessions");
var bodyParser = require("body-parser");
var fs = require("fs");
const exphbs = require ("express-handlebars");

var app = express();
app.use(express.static('public')); 

var HTTP_PORT = process.env.PORT || 8080;

const pathOfImg = "./public/images/uploaded";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, pathOfImg))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});



const upload = multer({ storage: storage });

app.use(function(req,res,next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
  next();
 });

app.engine('.hbs', exphbs({ extname: '.hbs',
                            defaultLayout: "main",
                            helpers: {       
                                      navLink: function(url, options){
                                      return '<li' +
                                     ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                                     '><a href="' + url + '">' + options.fn(this) + '</a></li>';},

                                     equal: function (lvalue, rvalue, options) {
                                     if (arguments.length < 3)
                                     throw new Error("Handlebars Helper equal needs 2 parameters");
                                     if (lvalue != rvalue) {
                                     return options.inverse(this);
                                     } else {
                                     return options.fn(this); }}  
                  }
}));

app.set('view engine', '.hbs');

app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60,
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.get("/", function(req,res){
  res.render("home");
});

app.get("/about", function(req,res){
  res.render("about");
});

app.get("/employees/add", ensureLogin, function (req, res) {
  dataSrv
    .getDepartments()
    .then(function (data) {
  res.render("addEmployee", { departments: data });
    })
    .catch(function () {
      res.render("addEmployee", { departments: [] });
    });
});

app.get("/images/add", ensureLogin, function (req, res) {
  res.render("addImage");
});

app.post("/images/add", ensureLogin , upload.single("imageFile"), function (req, res) {
  res.redirect("/images");
});



app.get("/images", ensureLogin, (request, response) => {

  fs.readdir('./public/images/uploaded', (excep, items) => 
  {
    if (excep) 
    {
      console.log("Unable to read the file!");
    } 
    else 
    {
      response.render("images", { images: items })
    }
  })
});
 
  
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/departments", ensureLogin, function(req,res){
   
    dataSrv.getDepartments().then(function(data)  {
                                console.log ("display getDepartments");
                                if (data.length > 0) {
                                  res.render("departments", { departments: data });
                                } else {
                                  res.render("departments", { message: "no results" });
                                }
                            })
                            .catch((errorMassage) => {
                                console.log(errorMassage);
                                res.render("departments", {massage: "no data found"});
                            })
   });
   
 
  app.get("/employee/:empNum", ensureLogin,  function (req, res) {
    let viewData = {};

  dataSrv
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        viewData.employee = data;
      } else {
        viewData.employee = null;
      }
    })
    .catch(() => {
      viewData.employee = null;
    })
    .then(dataSrv.getDepartments)
    .then((data) => {
      viewData.departments = data;

      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      }
    })
    .catch(() => {
      viewData.departments = [];
    })
    .then(() => {
      if (viewData.employee == null) {
        res.status(404).send("Employee Not Found");
      } else {
        res.render("employee", { viewData: viewData });
      }
    });
  });
  
  app.post("/employees/add", ensureLogin,  function (req, res) {
    dataSrv.addEmployee(req.body)
      .then(() => {
        res.redirect("/employees");
      })
      .catch((errorMassage) => {
        res.status(500).send("employee can't be updated");
      });
  });


  app.post("/employee/update", ensureLogin,  (req, res) => {
    dataSrv.updateEmployee(req.body)
                                     .then(() => {
                                      res.redirect("/employees");
                                     })
                                     .catch((errorMassage)=>{
                                       console.log (errorMassage);
                                     })
  });
  
  app.get("/employees", ensureLogin, function (req, res) {

    if (req.query.department) {
      dataSrv.getEmployeesByDepartment(req.query.department)
        .then((data) => {
          if (data.length > 0) {
            res.render("employees", { employees: data });
          } else {
            res.render("employees", { message: "no results" });
          }
        })
        .catch((errorMassage) => {
          res.render("employees",
{massage: "data is not found"})
        })
    }
  
    else if (req.query.isManager) {
      dataSrv.getEmployeesByManager(req.query.isManager)
        .then((data) => {
          if (data.length > 0) {
            res.render("employees", { employees: data });
          } else {
            res.render("employees", { message: "no results" });
          }
        })
        .catch((errorMassage) => {
          res.render("employees",
         {massage: "data is not found"})
        })
    }
    else if (req.query.status) {
      dataSrv.getEmployeesByStatus(req.query.status)
        .then((data) => {
          if (data.length > 0) {
            res.render("employees", { employees: data });
          } else {
            res.render("employees", { message: "no results" });
          }
        })
        .catch((errorMassage) => {
          res.render("employees",
          {massage: "data is not found"})
        })
    }
      else {
        dataSrv.getAllEmployees()
          .then((data) => {
            console.log("get getAllEmployees JSON");
            if (data.length > 0) {
              res.render("employees", { employees: data });
            } else {
              res.render("employees", { message: "there are no result found" });
            }
          })
          .catch((errorMassage) => {
            console.log(err);
            res.render("employees",
           {massage: "data is not found"})
          })
      }
  });

  app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
    dataSrv
      .deleteEmployeeByNum(req.params.empNum)
      .then((data) => {
        res.redirect("/employees");
      })
      .catch((errorMassage) => {
        res.status(500).send("Unable to Remove Employee / Employee not found");
      });
  });

  app.get("/department/:departmentId", ensureLogin, (req, res) => {
    dataSrv
      .getDepartmentById(req.params.departmentId)
      .then((data) => {
        if (data.length > 0) {
          res.render("department", { department: data });
        } else {
          res.status(404).send("Department Not Found");
        }
      })
      .catch((errorMassage) => {
        res.status(404).send("Department Not Found");
      });
  });

  app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
  });
  
  app.post("/departments/add", ensureLogin, (req, res) => {
    dataSrv
      .addDepartment(req.body)
      .then(() => {
        res.redirect("/departments");
      })
      .catch((errorMassage) => {
        console.log(errorMassage);
      });
  });

  app.post("/department/update", ensureLogin, (req, res) => {
    dataSrv
      .updateDepartment(req.body)
      .then(() => {
        res.redirect("/departments");
      })
      .catch((errorMassage) => {
        console.log(errorMassage);
      });
  });

  app.get("/departments/delete/:departmentId", ensureLogin, (req, res) => {
    dataSrv
      .deleteDepartmentById(req.params.departmentId)
      .then(() => {
        res.redirect("/departments");
      })
      .catch((errorMassage) => {
        res.status(500).send("Unable to Remove Department / Department not found");
      });
  });
 

  app.get("/login", function (req, res) {
    res.render("login");
  });
  
  app.get("/register", function (req, res) {
    res.render("register");
  });
  
  app.post("/register", function (req, res) {
    dataServiceAuth.registerUser(req.body)
      .then(() => res.render("register", { successMessage: "User created" }))
      .catch((err) =>
        res.render("register", { errorMessage: err, userName: req.body.userName })
      );
  });
  
  app.post("/login", function (req, res) {
    req.body.userAgent = req.get("User-Agent");
  
    dataServiceAuth
      .checkUser(req.body)
      .then((user) => {
        req.session.user = {
          userName: user.userName,
          email: user.email,
          loginHistory: user.loginHistory,
        };
  
        res.redirect("/employees");
      })
      .catch((err) => {
        res.render("login", { errorMessage: err, userName: req.body.userName });
      });
  });
  
  app.get("/logout", function (req, res) {
    req.session.reset();
    res.redirect("/");
  });
  
  app.get("/userHistory", ensureLogin, function (req, res) {
    res.render("userHistory");
  });

  app.use(function (req, res) {
    res.status(404).send("404 - Page Not Found");
  })
 
  dataSrv
  .initialize()
  .then(dataServiceAuth.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });
 
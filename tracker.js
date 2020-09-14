const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "groceteria2020",
  database: "employee_tracker",
});

connection.connect(function (err) {
  if (err) throw err;
  init();
});

const actions = [
  {
    type: "list",
    name: "action",
    message: "Choose an action:",
    choices: [
      {
        name: "View Departments",
        value: "view_departments",
      },
      {
        name: "View Roles",
        value: "view_roles",
      },
      {
        name: "View Employees",
        value: "view_employees",
      },
      {
        name: "Add Department",
        value: "add_department",
      },
      {
        name: "Add Role",
        value: "add_role",
      },
      {
        name: "Add Employee",
        value: "add_employee",
      },
      {
        name: "Update Employee Role",
        value: "update_employee_role",
      },
      {
        name: "Update Employee Manager",
        value: "update_employee_manager"
      },
      {
        name: "Quit",
        value: "quit"
      }
    ],
  },
];

const roles = {
  name: "role",
  type: "list",
  message: "Choose a Role: ",
  choices: [
    {
      name: "Sales Lead",
      value: 1,
    },
    {
      name: "Salesperson",
      value: 2,
    },
    {
      name: "Lead Engineer",
      value: 3,
    },
    {
      name: "Software Engineer",
      value: 4,
    },
    {
      name: "Account Manager",
      value: 5,
    },
    {
      name: "Accountant",
      value: 6,
    },
    {
      name: "Legal Team Lead",
      value: 7,
    },
    {
      name: "Lawyer",
      value: 8,
    }]
  }

function viewDepartments() {
  const query = `
        SELECT *
        FROM department
    `;
  connection.query(query, (err, res) => {
    console.table(res);
    init();
  });
}

function viewRoles() {
  const query = `
        SELECT title, FORMAT(salary, 0) AS salary, name AS department
        FROM role
        JOIN department
        ON role.department_id = department.id
    `;
  connection.query(query, (err, res) => {
    console.table(res);
    init();
  });
}

function viewEmployees() {
  const query = `
        SELECT
        emp.id, emp.first_name, emp.last_name, title, FORMAT(salary,0) AS salary, manager.first_name || ' ' || manager.last_name AS manager
        FROM employee AS emp
        JOIN role
        ON emp.role_id = role.id
        LEFT JOIN employee AS manager
        ON emp.manager_id = manager.id
      `;
  connection.query(query, (err, res) => {
    console.table(res);
    init();
  });
}

function addEmployee() {
  const employeeQuestions = [
    {
      name: "first_name",
      type: "input",
      message: "First Name: ",
    },
    {
      name: "last_name",
      type: "input",
      message: "Last Name: ",
    },
      roles
    ];

  inquirer.prompt(employeeQuestions).then((responses) => {
    const query = `
        INSERT INTO employee(first_name, last_name, role_id)
        VALUES (?, ?, ?)
    `;
    connection.query(
      query,
      [responses.first_name, responses.last_name, responses.role],
      (err, res) => {
        if (err) console.log(err);
        else console.log("\nEmployee Added!\n");
        init();
      }
    );
  });
}

function updateEmployeeManager() {
  const query = `
  SELECT
  id, first_name, last_name
  fROM employee
  `;

  let employees = [];
  let employeeChoices = [];

  connection.query(
    query, (err, res) => {
      if (err) console.log(err);
      else {
        employees = JSON.parse(JSON.stringify(res));
        employees.forEach(employee => {
          employeeChoices.push({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id
          });
        });
        inquirer.prompt({
          name: "employee",
          type: "list",
          message: "Select employee: ",
          choices: employeeChoices
        }).then((response) => {
          console.log(response);
        });
      }
    }
  )
}

function init() {
  inquirer.prompt(actions).then((response) => {
    switch (response.action) {
      case "view_departments":
        viewDepartments();
        break;
      case "view_roles":
        viewRoles();
        break;
      case "view_employees":
        viewEmployees();
        break;
      case "add_department":
        addDepartment();
        break;
      case "add_role":
        addRole();
        break;
      case "add_employee":
        addEmployee();
        break;
      case "update_employee_role":
        updateEmployeeRole();
        break;
      case "update_employee_manager":
        updateEmployeeManager();
        break;
      case "quit":
        process.exit();
    }
  });
}

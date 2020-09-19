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
        value: "update_employee_manager",
      },
      {
        name: "Quit",
        value: "quit",
      },
    ],
  },
];

function viewDepartments() {
  const query = `
      SELECT
      d.id, name, CONCAT('$', FORMAT(SUM(CASE WHEN e.id IS NULL THEN 0 ELSE salary END),0)) AS budget
      FROM
      role r
      LEFT JOIN
      employee e
      ON e.role_id = r.id
      RIGHT JOIN department d
      ON r.department_id = d.id
      GROUP BY d.id, name
    `;
  connection.query(query, (err, res) => {
    console.table(res);
    init();
  });
}

function viewRoles() {
  const query = `
        SELECT title, CONCAT('$', FORMAT(salary, 0)) AS salary, name AS department
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
        emp.id, emp.first_name, emp.last_name, title, CONCAT('$', FORMAT(salary,0)) AS salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
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

function addDepartment() {
  const departmentQuestions = [
    {
      name: "name",
      type: "input",
      message: "Department Name:",
    },
  ];

  inquirer.prompt(departmentQuestions).then((responses) => {
    const query = `
        INSERT INTO department(name)
        VALUES (?)
    `;
    connection.query(query, [responses.name], (err, res) => {
      if (err) console.log(err);
      else console.log("\nDepartment Added!\n");
      init();
    });
  });
}

function addRole() {
  let departments = [];
  let departmentChoices = [];

  const query = `
  SELECT *
  FROM department
  `;

  connection.query(query, (err, res) => {
    if (err) console.log(err);
    else {
      departments = JSON.parse(JSON.stringify(res));
      departments.forEach((department) => {
        departmentChoices.push({
          name: department.name,
          value: department.id,
        });
      });
    }
  });

  const roleQuestions = [
    {
      name: "title",
      type: "input",
      message: "Role Title:",
    },
    {
      name: "salary",
      type: "input",
      message: "Role Salary:",
    },
    {
      name: "department",
      type: "list",
      message: "Select Department:",
      choices: departmentChoices,
    },
  ];

  inquirer.prompt(roleQuestions).then((responses) => {
    const query = `
        INSERT INTO role(title, salary, department_id)
        VALUES (?, ?, ?)
    `;
    connection.query(
      query,
      [responses.title, responses.salary, responses.department],
      (err, res) => {
        if (err) console.log(err);
        else console.log("\nRole Added!\n");
        init();
      }
    );
  });
}

function addEmployee() {
  let roles = [];
  let roleChoices = [];

  const query = `
  SELECT *
  FROM role
  `;

  connection.query(query, (err, res) => {
    if (err) console.log(err);
    else {
      roles = JSON.parse(JSON.stringify(res));
      roles.forEach((role) => {
        roleChoices.push({
          name: role.title,
          value: role.id,
        });
      });
    }
  });

  const employeeQuestions = [
    {
      name: "first_name",
      type: "input",
      message: "First Name:",
    },
    {
      name: "last_name",
      type: "input",
      message: "Last Name:",
    },
    {
      name: "role",
      type: "list",
      message: "Select Role:",
      choices: roleChoices,
    },
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

function updateEmployeeRole() {
  const query = `
  SELECT
  id, first_name, last_name
  FROM employee
  `;

  let employees = [];
  let employeeChoices = [];
  let employeeId;

  let roles = [];
  let roleChoices = [];

  const roleQuery = `
  SELECT id, title
  FROM role
  `;

  connection.query(roleQuery, (err, res) => {
    if (err) console.log(err);
    else {
      roles = JSON.parse(JSON.stringify(res));
      roles.forEach((role) => {
        roleChoices.push({
          name: role.title,
          value: role.id,
        });
      });
    }
  });

  connection.query(query, (err, res) => {
    if (err) console.log(err);
    else {
      employees = JSON.parse(JSON.stringify(res));
      employees.forEach((employee) => {
        employeeChoices.push({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        });
      });
      inquirer
        .prompt({
          name: "employee",
          type: "list",
          message: "Select Employee:",
          choices: employeeChoices,
        })
        .then((response) => {
          employeeId = response.employee;

          inquirer
            .prompt({
              name: "role",
              type: "list",
              message: "Select Role:",
              choices: roleChoices,
            })
            .then((response) => {
              let updateQuery = `
              UPDATE employee
              SET role_id = ?
              WHERE id = ?
            `;
              connection.query(
                updateQuery,
                [response.role, employeeId],
                (err, res) => {
                  if (err) console.log(err);
                  else console.log("\nEmployee Role Set!\n");
                  init();
                }
              );
            });
        });
    }
  });
}

function updateEmployeeManager() {
  const query = `
  SELECT
  id, first_name, last_name
  FROM employee
  `;

  let employees = [];
  let employeeChoices = [];
  let employeeId;

  connection.query(query, (err, res) => {
    if (err) console.log(err);
    else {
      employees = JSON.parse(JSON.stringify(res));
      employees.forEach((employee) => {
        employeeChoices.push({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id,
        });
      });
      inquirer
        .prompt({
          name: "employee",
          type: "list",
          message: "Select Employee:",
          choices: employeeChoices,
        })
        .then((response) => {
          // Filter out selected employee
          employeeId = response.employee;
          let managerChoices = employeeChoices.filter(
            (choice) => choice.value != employeeId
          );
          inquirer
            .prompt({
              name: "manager",
              type: "list",
              message: "Select Manager:",
              choices: managerChoices,
            })
            .then((response) => {
              let updateQuery = `
              UPDATE employee
              SET manager_id = ?
              WHERE id = ?
            `;
              connection.query(
                updateQuery,
                [response.manager, employeeId],
                (err, res) => {
                  if (err) console.log(err);
                  else console.log("\nEmployee Manager Set!\n");
                  init();
                }
              );
            });
        });
    }
  });
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

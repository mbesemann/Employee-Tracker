--Add departments

INSERT INTO department(name) VALUES('Sales');
INSERT INTO department(name) VALUES('Engineering');
INSERT INTO department(name) VALUES('Finance');
INSERT INTO department(name) VALUES('Legal');

--Add roles

INSERT INTO role(title, salary, department_id) VALUES('Sales Lead', 60000, 1);
INSERT INTO role(title, salary, department_id) VALUES('Salesperson', 40000, 1);
INSERT INTO role(title, salary, department_id) VALUES('Lead Engineer', 90000, 2);
INSERT INTO role(title, salary, department_id) VALUES('Software Engineer', 70000, 2);
INSERT INTO role(title, salary, department_id) VALUES('Account Manager', 80000, 3);
INSERT INTO role(title, salary, department_id) VALUES('Accountant', 60000, 3);
INSERT INTO role(title, salary, department_id) VALUES('Legal Team Lead', 100000, 4);
INSERT INTO role(title, salary, department_id) VALUES('Lawyer', 90000, 4);
# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |home.tsx|none|none|
| Register new user<br/>(t@jwt.com, pw: test)         |register.tsx|[POST] /api/auth|'INSERT INTO user (name, email, password) VALUES (?, ?, ?)' <br/> 'INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)'
| Login new user<br/>(t@jwt.com, pw: test)            |login.tsx  |[PUT] /api/auth |'INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token' |
| Order pizza                                         | menu.tsx, payment.tsx |{POST] '/api/order'|'INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (? ?, ?, ?)', |
| Verify pizza                                        |delivery.tsx|[POST] /api/order/verify|none|
| View profile page                                   |dinerDashboard.tsx|[GET] '/api/order'|'SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=? LIMIT ${offset},${config.db.listPerPage}`<br/>`SELECT id, menuId, description, price FROM orderItem WHERE orderId=?`|
| View franchise<br/>(as diner)                       |franchiseDashboard.tsx|none|none|
| Logout                                   |        logout.tsx            |[DELETE] 'api/auth'|'DELETE FROM auth WHERE token=?'|
| View About page                                     |             about.tsx       |     none              |      none        |
| View History page                                   |                history.tsx    |      none             |          none|
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |        login.tsx            |          [PUT] /api/auth         |       `INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token'    |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx   | [GET] api/franchise/:userId|  'SELECT objectId FROM userRole WHERE role='franchisee'' AND userId=?' <br/> 'SELECT id, name FROM franchise WHERE id in (${franchiseIds.join(',')})` |
| Create a store                                      |franchiseDashboard.tsx, createStore.tsx|[GET] /api/franchise/${user.id}|     `INSERT INTO store (franchiseId, name) VALUES (?, ?)`         |
| Close a store    |franchiseDashboard.tsx, closeStore.tsx|[DELETE] /api/franchise/${franchise.id}/store/${store.id}|`DELETE FROM store WHERE franchiseId=? AND id=?`|
| Login as admin<br/>(a@jwt.com, pw: admin)           |login.tsx|[PUT] /api/auth|`INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token`|
| View Admin page                                     |                 adminDashboard.tsx |none|none|
| Create a franchise for t@jwt.com                    |                    createFranchise.tsx, adminDashboard.tsx|[POST] /api/franchise|`SELECT id, name FROM user WHERE email=?`<br/>`INSERT INTO franchise (name) VALUES (?)`<br/>`INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)`|
| Close the franchise for t@jwt.com                   |closeFranchise.tsx, adminDashboard.tsx|[DELETE] /api/franchise/:franchiseId|`DELETE FROM store WHERE franchiseId=?`<br/>`DELETE FROM userRole WHERE objectId=?`<br/>`DELETE FROM franchise WHERE id=?`|

# DevTinder APIs

## authRouter
- POST /signup
- POST /login
- POST /logout

## profileRouter
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter
- POST /request/send/interested/:userId -> /request/send/:status/:userId
- POST /request/send/ignored/:userId -> /request/send/:status/:userId
- POST /request/review/accepted/:requestId -> /request/review/:status/:requestId
- POST /request/review/rejected/:requestId -> /request/review/:status/:requestId

## userRouter
- GET /user/connections
- GET /user/requests/received
- GET /user/feed

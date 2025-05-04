db = db.getSiblingDB('nest') 
db.createUser({
    user: "appuser",
    pwd: "apppassword",
    roles: [
      {
        role: "readWrite",
        db: "nest"
      }
    ]
  });
  
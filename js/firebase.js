import {
getAuth
}
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const auth=
getAuth(app);

export{
db,
auth
};
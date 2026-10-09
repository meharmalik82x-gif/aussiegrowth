fetch("gorilla.svg?"+Date.now()).then(r=>r.text()).then(s=>["a","b"].forEach(i=>document.getElementById(i).innerHTML=s))

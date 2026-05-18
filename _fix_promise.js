var fs = require('fs');
var path = 'C:/Users/Administrator/morph-landing/app.js';
var js = fs.readFileSync(path, 'utf8');

// 1. Remove orphaned promise details from renderCoursesSub()
var target = "  body.innerHTML = h;\n  renderCourseList('all');\n  /* promise details */\n  var pd = C.promise && C.promise.details;\n  if (pd && pd.length > 0) {\n    h += '<div class=\"ticket-card\" style=\"margin-top:10px\"><div class=\"ticket-card-h\">兵姐的承诺 · 详细说明</div>';\n    h += '<ul class=\"ticket-earn-list\">';\n    pd.forEach(function(d) {\n      h += '<li>' + d + '</li>';\n    });\n    h += '</ul></div>';\n  }\n\n}\n\nfunction switchCourseCat";

var replacement = "  body.innerHTML = h;\n  renderCourseList('all');\n}\n\nfunction switchCourseCat";

if (js.indexOf(target) !== -1) {
  js = js.replace(target, replacement);
  console.log('Fixed renderCoursesSub: removed orphaned promise details');
} else {
  console.log('ERROR: Could not find target in renderCoursesSub');
  // Try to find where it might differ
  var idx = js.indexOf("renderCourseList('all');");
  if (idx !== -1) {
    console.log('Found renderCourseList at index', idx);
    console.log('Context:', js.substring(idx, idx + 300));
  }
}

// 2. Add promise details to renderTicketsSub() before body.innerHTML = h;
var ticketsTarget = "  body.innerHTML = h;\n}\n\n/* ---- S-关于兵姐 ---- */\nfunction renderAboutSub()";

var promiseBlock = `  /* promise details */\n  var pd = C.promise && C.promise.details;\n  if (pd && pd.length > 0) {\n    h += '<div class="ticket-card" style="margin-top:10px"><div class="ticket-card-h">兵姐的承诺 · 详细说明</div>';\n    h += '<ul class="ticket-earn-list">';\n    pd.forEach(function(d) {\n      h += '<li>' + d + '</li>';\n    });\n    h += '</ul></div>';\n  }\n  \n  body.innerHTML = h;\n}\n\n/* ---- S-关于兵姐 ---- */\nfunction renderAboutSub()`;

if (js.indexOf(ticketsTarget) !== -1) {
  js = js.replace(ticketsTarget, promiseBlock);
  console.log('Fixed renderTicketsSub: added promise details before body.innerHTML');
} else {
  console.log('ERROR: Could not find tickets target');
  var idx = js.indexOf("/* ---- S-关于兵姐 ---- */");
  if (idx !== -1) {
    console.log('Found S-about at index', idx);
    console.log('Context before:', js.substring(idx - 100, idx));
  }
}

fs.writeFileSync(path, js);
console.log('Done');

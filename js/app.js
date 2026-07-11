console.log('Church Volunteer Scheduler v1.0.0-alpha5.3 stable qualifications panels');
import { auth, db, firebaseConfigured } from './firebase.js';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail, onAuthStateChanged, updatePassword
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  collection, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc,
  onSnapshot, serverTimestamp, query, orderBy, where, getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const $ = s => document.querySelector(s);
const appEl = $('#app');
const nowDate = () => new Date().toISOString().slice(0,10);
const esc = (s='') => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate = d => d ? new Date(d+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : '';
const timeLabel = t => { if(!t)return ''; let [h,m]=String(t).split(':').map(Number); const a=h>=12?'PM':'AM'; h=h%12||12; return `${h}:${String(m||0).padStart(2,'0')} ${a}`; };
const MAX_ALLOWED_OVERLAP_MINUTES = 15;
const minutesFromTime = t => { const [h,m]=String(t||'').split(':').map(Number); return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null; };
function overlapMinutes(a,b){
  if(!a||!b||a.date!==b.date)return 0;
  const aStart=minutesFromTime(a.start),aEnd=minutesFromTime(a.end),bStart=minutesFromTime(b.start),bEnd=minutesFromTime(b.end);
  if([aStart,aEnd,bStart,bEnd].some(v=>v===null))return 0;
  return Math.max(0,Math.min(aEnd,bEnd)-Math.max(aStart,bStart));
}
function volunteerConflicts(volunteerId,targetServiceId){
  const target=state.services.find(s=>s.id===targetServiceId);
  if(!target)return [];
  return state.assignments.filter(a=>a.volunteerId===volunteerId&&!a.archived).map(a=>({assignment:a,service:state.services.find(s=>s.id===a.serviceId)})).filter(x=>x.service&&!x.service.archived).map(x=>({...x,minutes:overlapMinutes(target,x.service)})).filter(x=>x.minutes>0);
}

let state={user:null,profile:null,services:[],ministries:[],roles:[],users:[],assignments:[],ready:false,view:localStorage.getItem('cvsView')||'home',calendarMonth:nowDate().slice(0,7),selectedCalendarDate:nowDate()};
let unsubs=[];
let peopleUI={search:'',role:'all',status:'all',page:1,pageSize:10};
const adminOpenSections=new Set();
const qualificationOpenUsers=new Set();
const cleanup=()=>{unsubs.forEach(fn=>fn&&fn());unsubs=[]};
const isAdmin=()=>state.profile?.role==='admin';
const isCoordinator=()=>['coordinator','admin'].includes(state.profile?.role);
const isVolunteer=()=>['volunteer','volunteerS'].includes(state.profile?.role);
const canManageService=()=>isCoordinator();

function friendly(e){const m={'auth/email-already-in-use':'This email is already registered.','auth/weak-password':'Password must be at least 6 characters.','auth/invalid-email':'Please enter a valid email.','auth/invalid-credential':'Email or password is incorrect.','auth/network-request-failed':'Please check your internet connection.','permission-denied':'You do not have permission for that action.'};return m[e?.code]||e?.message||'Something went wrong.'}

if(!firebaseConfigured){renderSetup();} else onAuthStateChanged(auth,async user=>{cleanup();state={...state,user,profile:null,services:[],ministries:[],roles:[],users:[],assignments:[],ready:false};if(!user)return renderLogin();await ensureProfile(user);startListeners();});

function renderSetup(){appEl.innerHTML=`<div class="wrap login"><div><div class="hero brandHero loginBrandHero"><div class="brandLeft"><img src="images/church-logo.svg" class="powerDinkLogo" alt="Church logo"><span class="brandDivider"></span><div class="brandTitle"><h1>Church Volunteer Scheduler</h1><p>v1.0.0 Alpha 4.1</p></div></div></div><div class="card"><h2>Connect Firebase First</h2><div class="notice warn"><b>This build is ready, but it is intentionally not connected to the old Pickleball database.</b></div><p>Open <code>js/firebase.js</code> and paste the Web App configuration from your new church Firebase project.</p><p class="small">This protects your existing PowerDink data from being mixed with church schedules.</p></div></div></div>`}

async function ensureProfile(user){const ref=doc(db,'users',user.uid);let snap=await getDoc(ref);if(!snap.exists()){await setDoc(ref,{name:user.email.split('@')[0],email:user.email,status:'pending',role:'pending',ministryIds:[],createdAt:serverTimestamp()});snap=await getDoc(ref)}state.profile={id:user.uid,...snap.data()}}
function startListeners(){
  unsubs.push(onSnapshot(query(collection(db,'services'),orderBy('date')),s=>{state.services=s.docs.map(d=>({id:d.id,...d.data()}));state.ready=true;render()},renderError));
  unsubs.push(onSnapshot(collection(db,'ministries'),s=>{state.ministries=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));render()},console.error));
  unsubs.push(onSnapshot(collection(db,'roles'),s=>{state.roles=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));render()},console.error));
  unsubs.push(onSnapshot(collection(db,'assignments'),s=>{state.assignments=s.docs.map(d=>({id:d.id,...d.data()}));render()},console.error));
  unsubs.push(onSnapshot(doc(db,'users',state.user.uid),s=>{if(s.exists()){state.profile={id:s.id,...s.data()};render()}},console.error));
  if(isCoordinator())unsubs.push(onSnapshot(collection(db,'users'),s=>{state.users=s.docs.map(d=>({id:d.id,...d.data()}));render()},console.error));
}
function renderError(e){appEl.innerHTML=`<div class="wrap"><div class="card"><h2>Firebase Error</h2><div class="error">${esc(friendly(e))}</div></div></div>`}
function render(){if(!state.user)return renderLogin();if(!state.ready)return appEl.innerHTML='<div class="wrap"><div class="card"><h2>Loading...</h2></div></div>';renderApp()}
function nav(v){state.view=v;localStorage.setItem('cvsView',v);render()} window.nav=nav;

function renderLogin(){appEl.innerHTML=`<div class="wrap login"><div><div class="hero brandHero loginBrandHero"><div class="brandLeft"><img src="images/church-logo.svg" class="powerDinkLogo" alt="Church logo"><span class="brandDivider"></span><div class="brandTitle"><h1>Church Volunteer Scheduler</h1><p>View your next service and volunteer assignment.</p></div></div></div><div class="card"><h2>Login</h2><label>Email</label><input id="email" type="email"><label>Password</label><div class="passwordBox"><input id="pass" type="password"><button class="secondary" onclick="togglePass('pass',this)">Show</button></div><div class="row" style="margin-top:14px"><button onclick="login()">Login</button><button class="secondary" onclick="createAccount()">Create Account</button><button class="ghost" onclick="forgotPassword()">Forgot Password</button></div><p class="small">New accounts start as Pending. Pending users can view the next service and calendar while waiting for approval.</p></div></div></div>`}
window.togglePass=(id,b)=>{const e=document.getElementById(id);e.type=e.type==='password'?'text':'password';b.textContent=e.type==='password'?'Show':'Hide'};
window.login=async()=>{try{await signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#pass').value)}catch(e){alert(friendly(e))}};
window.createAccount=async()=>{try{const email=$('#email').value.trim(),pass=$('#pass').value;if(!email||!pass)return alert('Enter email and password.');await createUserWithEmailAndPassword(auth,email,pass)}catch(e){alert(friendly(e))}};
window.forgotPassword=async()=>{const email=$('#email')?.value.trim()||prompt('Enter your email');if(!email)return;try{await sendPasswordResetEmail(auth,email);alert('Password reset email sent.')}catch(e){alert(friendly(e))}};
window.logout=()=>signOut(auth);

function renderApp(){const tabs=[['home','Home'],['calendar','Calendar'],['profile','Profile']];if(isCoordinator())tabs.push(['schedule','Schedule']);if(isAdmin())tabs.push(['admin','Admin']);appEl.innerHTML=`<div class="wrap"><div class="hero heroWithBell brandHero"><div class="brandLeft"><img src="images/church-logo.svg" class="powerDinkLogo" alt="Church logo"><span class="brandDivider"></span><div class="brandTitle"><h1>Church Volunteer Scheduler</h1><p>${esc(state.profile?.name||state.user.email)} • ${esc(roleLabel(state.profile?.role))}</p></div></div></div><div class="tabs">${tabs.map(([v,l])=>`<button class="tab ${state.view===v?'active':''}" onclick="nav('${v}')">${l}</button>`).join('')}<button class="tab" onclick="logout()">Logout</button></div><main id="main"></main><div class="footer">Securely connected • Church Volunteer Scheduler v1.0.0-alpha5.3</div></div>`;if(state.view==='calendar')renderCalendar();else if(state.view==='profile')renderProfile();else if(state.view==='schedule'&&isCoordinator())renderSchedule();else if(state.view==='admin'&&isAdmin())renderAdmin();else renderHome()}
const roleLabel=r=>({pending:'Pending / Schedule View',scheduleViewer:'Schedule Viewer',volunteer:'Volunteer',volunteerS:'Volunteer (S)',coordinator:'Coordinator',admin:'Admin'}[r]||'Pending');
function visibleMinistries(){return state.ministries.filter(m=>m.visible!==false&&!m.archived)}
function visibleRoles(ministryId){return state.roles.filter(r=>r.ministryId===ministryId&&r.visible!==false&&!r.archived)}
function userQualifications(u){return Array.isArray(u?.qualifications)?u.qualifications:[]}
function qualificationFor(u,ministryId){return userQualifications(u).find(q=>q.ministryId===ministryId)}
function isQualifiedFor(u,ministryId,roleId){const q=qualificationFor(u,ministryId);return !!q && Array.isArray(q.roleIds) && q.roleIds.includes(roleId)}
function qualifiedUsers(ministryId,roleId){return state.users.filter(u=>['volunteer','volunteerS','coordinator','admin'].includes(u.role)&&isQualifiedFor(u,ministryId,roleId))}
function isVolunteerSUser(userId){return state.users.find(u=>u.id===userId)?.role==='volunteerS'}
function upcomingServices(){return [...state.services].filter(s=>!s.archived&&s.date&&new Date(s.date+'T23:59:59')>=new Date()).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))}
function serviceAssignments(id){return state.assignments.filter(a=>a.serviceId===id&&!a.archived)}
function myAssignments(){return state.assignments.filter(a=>a.volunteerId===state.user.uid&&!a.archived)}

function renderHome(){
  const upcoming=upcomingServices();
  const profileName=state.profile?.name||state.user?.email?.split('@')[0]||'there';
  if(!upcoming.length){
    $('#main').innerHTML=`<section class="homeWelcome"><div class="homeAvatar">${homeInitials(profileName)}</div><div><h1>Welcome, ${esc(profileName)}!</h1><p>No upcoming services have been scheduled yet.</p></div></section><div class="card"><h2>No upcoming services</h2><p class="small">The next service will appear here when a coordinator adds it.</p></div>`;
    return;
  }

  const focusDate=upcoming[0].date;
  const focusServices=upcoming.filter(s=>s.date===focusDate);
  const futureServices=upcoming.filter(s=>s.date!==focusDate);
  const futureDates=[...new Set(futureServices.map(s=>s.date))];

  $('#main').innerHTML=`
    <section class="homeWelcome">
      <div class="homeAvatar">${homeInitials(profileName)}</div>
      <div class="homeWelcomeCopy">
        <h1>${homeGreeting()}, ${esc(profileName)}!</h1>
        <p>Here’s what’s happening with your church schedule.</p>
      </div>
      <div class="homeToday"><span>Today is</span><b>${fmtDate(nowDate())}</b></div>
    </section>

    <div class="homeDashboard">
      <section class="homePrimary">
        <div class="homeSectionHeading">
          <div>
            <h2>${focusDate===nowDate()?'Today’s Services':'Next Service Day'}</h2>
            <p>${fmtDate(focusDate)}</p>
          </div>
          <span class="homeCount">${focusServices.length} ${focusServices.length===1?'Service':'Services'}</span>
        </div>
        <div class="homeServiceList">
          ${focusServices.map((s,i)=>homeServiceCard(s,i===0)).join('')}
        </div>
        <button class="homeCalendarLink" onclick="nav('calendar')">View Full Calendar <span>›</span></button>
      </section>

      <aside class="homeSidebar">
        <div class="homeSideCard">
          <div class="homeSideHeading"><h3>Upcoming Services</h3><span>Future dates</span></div>
          ${futureDates.length
            ? futureDates.slice(0,6).map(date=>homeFutureDate(date,futureServices.filter(s=>s.date===date))).join('')
            : '<p class="small">No later services scheduled.</p>'}
          ${futureDates.length>6?`<button class="homeViewAll" onclick="nav('calendar')">View All</button>`:''}
        </div>
      </aside>
    </div>`;
}
function renderVolunteerHome(upcoming){renderHome()}
function homeGreeting(){
  const h=new Date().getHours();
  return h<12?'Good morning':h<18?'Good afternoon':'Good evening';
}
function homeInitials(name){
  const parts=String(name||'').trim().split(/[\s._-]+/).filter(Boolean);
  return esc((parts.length>1?parts[0][0]+parts[parts.length-1][0]:String(name||'?').slice(0,2)).toUpperCase());
}
function myServiceAssignment(serviceId){
  return serviceAssignments(serviceId).find(a=>a.volunteerId===state.user?.uid);
}
function homeServiceCard(s,isFirst=false){
  const assignments=serviceAssignments(s.id);
  const mine=myServiceAssignment(s.id);
  const d=new Date(s.date+'T12:00:00');
  const ministry=mine?state.ministries.find(m=>m.id===mine.ministryId):null;
  return `<article class="homeServiceCard ${isFirst?'homeServiceFirst':''}">
    <div class="homeServiceDate">
      <span>${d.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase()}</span>
      <strong>${d.getDate()}</strong>
      <b>${d.toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</b>
    </div>
    <div class="homeServiceContent">
      <div class="homeServiceTop">
        <div>
          <h3>${esc(s.title||'Church Service')}</h3>
          <p>◷ ${timeLabel(s.start)}${s.end?' – '+timeLabel(s.end):''}</p>
          <p>📍 ${esc(s.location||'Location TBD')}</p>
        </div>
        <span class="badge green">${esc((s.status||'scheduled').toUpperCase())}</span>
      </div>

      ${mine?`<details class="homeAssignment" open>
        <summary>
          <span><small>MY ASSIGNMENT</small><b>${esc(ministry?.name||'Ministry')} • ${esc(mine.roleName||'Volunteer')}</b></span>
          <span class="homeCollapseIcon">⌄</span>
        </summary>
        <div class="homeAssignmentBody">
          <div><small>Ministry</small><b>${esc(ministry?.name||'Ministry')}</b></div>
          <div><small>Role</small><b>${esc(mine.roleName||'Volunteer')}</b></div>
        </div>
      </details>`:''}

      <div class="homeMinistries">
        ${assignments.length
          ? homeMinistryGroups(assignments,isFirst)
          : '<div class="homeNoAssignments"><p class="small">No volunteers assigned yet.</p></div>'}
      </div>
    </div>
  </article>`;
}
function homeMinistryGroups(assignments,openFirst=false){
  const groups=new Map();
  assignments.forEach(a=>{
    const ministry=state.ministries.find(m=>m.id===a.ministryId);
    const ministryName=ministry?.name||'Other Ministry';
    if(!groups.has(ministryName))groups.set(ministryName,[]);
    groups.get(ministryName).push(a);
  });
  return [...groups.entries()]
    .sort((a,b)=>a[0].localeCompare(b[0]))
    .map(([ministryName,items],index)=>{
      const sorted=[...items].sort((a,b)=>String(a.roleName||'').localeCompare(String(b.roleName||''))||String(a.volunteerName||'').localeCompare(String(b.volunteerName||'')));
      return `<details class="homeMinistryGroup" ${(openFirst&&index===0)?'open':''}>
        <summary>
          <span>${esc(ministryName)} <small>(${sorted.length})</small></span>
          <span class="homeCollapseIcon">⌄</span>
        </summary>
        <div class="homeMinistryList">
          ${sorted.map(homeMinistryRow).join('')}
        </div>
      </details>`;
    }).join('');
}
function homeMinistryRow(a){
  const user=state.users.find(u=>u.id===a.volunteerId);
  const name=a.volunteerName||user?.name||'Volunteer';
  return `<div class="homeMinistryRow">
    <span class="homeTeamAvatar">${homeInitials(name)}</span>
    <div class="homeMinistryPerson">
      <b>${esc(name)}</b>
      <small>${esc(a.roleName||'Volunteer')}</small>
    </div>
  </div>`;
}
function homeFutureDate(date,services){
  const d=new Date(date+'T12:00:00');
  return `<details class="homeFutureDate">
    <summary>
      <div class="homeFutureCalendar"><span>${d.toLocaleDateString(undefined,{weekday:'short'}).toUpperCase()}</span><strong>${d.getDate()}</strong><b>${d.toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</b></div>
      <div><b>${esc(services.length===1?(services[0].title||'Service'):'Sunday Services')}</b><span>${services.length} ${services.length===1?'service':'services'}</span></div>
      <span class="homeFutureArrow">›</span>
    </summary>
    <div class="homeFutureBody">
      ${services.map(s=>`<div><b>${esc(s.title||'Service')}</b><span>${timeLabel(s.start)} • ${esc(s.location||'TBD')}</span></div>`).join('')}
    </div>
  </details>`;
}
function serviceFeature(s,ribbon='NEXT SERVICE'){const as=serviceAssignments(s.id);return `<section class="featuredEvent"><div class="featuredRibbon">⛪ ${esc(ribbon)}</div><div class="featuredDate"><span>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})}</span><b>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</b><strong>${new Date(s.date+'T12:00:00').getDate()}</strong><em>${new Date(s.date+'T12:00:00').getFullYear()}</em></div><div class="featuredMain"><div class="featuredTop"><div><h2>${esc(s.title||'Church Service')}</h2><p>🕒 ${timeLabel(s.start)}${s.end?' - '+timeLabel(s.end):''}<br>📍 ${esc(s.location||'Location TBD')}</p></div><div class="featuredBadges"><span class="badge green">${esc((s.status||'scheduled').toUpperCase())}</span></div></div>${s.notes?`<div class="notice info">${esc(s.notes)}</div>`:''}<h3>Scheduled Volunteers</h3>${renderAssignmentList(as)}</div></section>`}
function assignmentFeature(s,a,ribbon='MY NEXT ASSIGNMENT'){const m=state.ministries.find(x=>x.id===a.ministryId);return `<section class="featuredEvent"><div class="featuredRibbon">⭐ ${esc(ribbon)}</div><div class="featuredDate"><span>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})}</span><b>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</b><strong>${new Date(s.date+'T12:00:00').getDate()}</strong><em>${new Date(s.date+'T12:00:00').getFullYear()}</em></div><div class="featuredMain"><h2>${esc(s.title||'Church Service')}</h2><p>🕒 ${timeLabel(s.start)}${s.end?' - '+timeLabel(s.end):''}<br>📍 ${esc(s.location||'Location TBD')}</p><div class="notice"><b>Ministry:</b> ${esc(m?.name||'Ministry')}<br><b>Role:</b> ${esc(a.roleName||'Volunteer')}</div></div></section>`}
function serviceCollapsed(s){return `<details class="eventDetailsCard"><summary><div class="miniDate"><span>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})}</span><b>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</b><strong>${new Date(s.date+'T12:00:00').getDate()}</strong></div><div class="miniInfo"><b>${esc(s.title||'Service')}</b><span>${timeLabel(s.start)} • ${esc(s.location||'TBD')}</span></div><div class="miniCount">👥 ${serviceAssignments(s.id).length} assigned</div><button class="secondary expandBtn">Expand</button></summary><div class="eventExpanded">${renderAssignmentList(serviceAssignments(s.id))}</div></details>`}
function assignmentCollapsed(s,a){const m=state.ministries.find(x=>x.id===a.ministryId);return `<details class="eventDetailsCard"><summary><div class="miniDate"><span>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})}</span><b>${new Date(s.date+'T12:00:00').toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</b><strong>${new Date(s.date+'T12:00:00').getDate()}</strong></div><div class="miniInfo"><b>${esc(s.title||'Service')}</b><span>${esc(m?.name||'Ministry')} • ${esc(a.roleName||'Volunteer')}</span></div><button class="secondary expandBtn">Expand</button></summary><div class="eventExpanded"><p>🕒 ${timeLabel(s.start)} • 📍 ${esc(s.location||'TBD')}</p></div></details>`}
function renderAssignmentList(list){if(!list.length)return '<p class="small">No volunteers assigned yet.</p>';return list.map(a=>{const u=state.users.find(x=>x.id===a.volunteerId);const m=state.ministries.find(x=>x.id===a.ministryId);return `<div class="person"><span><b>${esc(a.volunteerName||u?.name||'Volunteer')}</b><div class="small">${esc(m?.name||'Ministry')} • ${esc(a.roleName||'Volunteer')}</div></span></div>`}).join('')}

function renderCalendar(){const [y,m]=state.calendarMonth.split('-').map(Number),first=new Date(y,m-1,1),days=new Date(y,m,0).getDate(),start=first.getDay(),by={};state.services.filter(s=>!s.archived).forEach(s=>(by[s.date]??=[]).push(s));let cells='';for(let i=0;i<start;i++)cells+='<div class="calendarCell empty"></div>';for(let d=1;d<=days;d++){const date=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;cells+=`<button class="calendarCell ${date===state.selectedCalendarDate?'selected':''} ${date===nowDate()?'today':''}" onclick="selectCalendarDate('${date}')"><span>${d}</span>${by[date]?.length?`<b>${by[date].length} service</b>`:''}</button>`}const selected=by[state.selectedCalendarDate]||[];$('#main').innerHTML=`<div class="card calendarCard"><div class="calendarHeader"><button class="secondary" onclick="changeCalendarMonth(-1)">‹</button><h2>${first.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><button class="secondary" onclick="changeCalendarMonth(1)">›</button></div><div class="calendarWeekdays">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendarGrid">${cells}</div><div class="calendarSelected"><h3>${fmtDate(state.selectedCalendarDate)}</h3>${selected.length?selected.map(s=>`<div class="calendarEvent"><div><b>${esc(s.title||'Service')}</b><div class="small">${timeLabel(s.start)} • ${esc(s.location||'TBD')}</div></div><div>${serviceAssignments(s.id).length} assigned</div></div>`).join(''):'<p class="small">No service scheduled for this date.</p>'}</div></div>`}
window.selectCalendarDate=d=>{state.selectedCalendarDate=d;renderCalendar()};window.changeCalendarMonth=n=>{const [y,m]=state.calendarMonth.split('-').map(Number),d=new Date(y,m-1+n,1);state.calendarMonth=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;state.selectedCalendarDate=state.calendarMonth+'-01';renderCalendar()};

function renderProfile(){const p=state.profile;$('#main').innerHTML=`<div class="card"><h2>Profile</h2><label>Name</label><input id="profileName" value="${esc(p.name||'')}"><label>Email</label><input value="${esc(state.user.email)}" disabled><label>Phone</label><input id="profilePhone" value="${esc(p.phone||'')}"><label>Account Type</label><input value="${esc(roleLabel(p.role))}" disabled><button style="margin-top:12px" onclick="saveProfile()">Save Profile</button></div><div class="card"><h2>Change Password</h2><input id="newPassword" type="password" placeholder="New password"><button style="margin-top:10px" onclick="changeMyPassword()">Change Password</button></div>`}
window.saveProfile=async()=>{await updateDoc(doc(db,'users',state.user.uid),{name:$('#profileName').value.trim(),phone:$('#profilePhone').value.trim()});alert('Profile saved.')};window.changeMyPassword=async()=>{const p=$('#newPassword').value;if(p.length<6)return alert('Use at least 6 characters.');try{await updatePassword(state.user,p);alert('Password changed.')}catch(e){alert(friendly(e))}};

function renderSchedule(){const services=[...state.services].filter(s=>!s.archived).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));$('#main').innerHTML=`<div class="card"><h2>Create / Edit Service</h2><input id="serviceId" type="hidden"><label>Service Name</label><input id="serviceTitle" value="Sunday Service"><div class="row"><div><label>Date</label><input id="serviceDate" type="date" value="${nowDate()}"></div><div><label>Start</label><input id="serviceStart" type="time" value="09:00"></div><div><label>End</label><input id="serviceEnd" type="time" value="11:00"></div></div><label>Location</label><input id="serviceLocation" value="Main Sanctuary"><label>Status</label><select id="serviceStatus"><option>scheduled</option><option>ready</option><option>cancelled</option></select><label>Notes</label><textarea id="serviceNotes"></textarea><div class="row"><button onclick="saveService()">Save Service</button><button class="secondary" onclick="clearServiceForm()">Clear</button></div></div><div class="card"><h2>Services</h2>${services.length?services.map(scheduleCard).join(''):'<p class="small">No services yet.</p>'}</div>`}
function scheduleCard(s){return `<details class="coordEventCard"><summary><div><div class="big">${fmtDate(s.date)} — ${esc(s.title||'Service')}</div><p>${timeLabel(s.start)} • ${esc(s.location||'TBD')} • ${serviceAssignments(s.id).length} assigned</p></div><div class="coordSummaryRight"><span class="badge green">${esc((s.status||'scheduled').toUpperCase())}</span><span class="coordExpandText">Expand</span></div></summary><div class="coordEventBody"><div class="row"><button class="secondary" onclick="editService('${s.id}')">Edit</button><button onclick="duplicateService('${s.id}')">Duplicate</button><button class="secondary" onclick="archiveService('${s.id}')">Archive</button>${isAdmin()?`<button class="danger" onclick="deleteService('${s.id}')">Delete</button>`:''}</div><h3>Assignments</h3>${renderEditableAssignments(s)}</div></details>`}
function renderEditableAssignments(s){
  const list=serviceAssignments(s.id),mins=visibleMinistries();
  const firstMin=mins[0]?.id||'';
  const roles=visibleRoles(firstMin);
  const firstRole=roles[0]?.id||'';
  const volunteers=qualifiedUsers(firstMin,firstRole);
  return `${list.map(a=>`<div class="person"><span><b>${esc(a.volunteerName||'Volunteer')}</b><div class="small">${esc(state.ministries.find(m=>m.id===a.ministryId)?.name||'Ministry')} • ${esc(a.roleName||'Volunteer')}</div></span><button class="danger" onclick="removeAssignment('${a.id}')">Remove</button></div>`).join('')||'<p class="small">No assignments yet.</p>'}
  <div class="row assignmentBuilder">
    <div><label>Ministry</label><select id="min-${s.id}" onchange="refreshAssignmentOptions('${s.id}')">${mins.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></div>
    <div><label>Role</label><select id="role-${s.id}" onchange="refreshVolunteerOptions('${s.id}')">${roles.map(r=>`<option value="${r.id}" data-name="${esc(r.name)}">${esc(r.name)}</option>`).join('')||'<option value="">No roles configured</option>'}</select></div>
    <div><label>Qualified Volunteer</label><select id="vol-${s.id}">${volunteers.map(u=>`<option value="${u.id}">${esc(u.name||u.email)}</option>`).join('')||'<option value="">No qualified volunteers</option>'}</select></div>
    <div style="align-self:end"><button onclick="addAssignment('${s.id}')">Add Volunteer</button></div>
  </div>
  <p class="small">Only volunteers approved for the selected ministry and role appear here. Regular volunteers may overlap by up to 15 minutes with confirmation. Volunteer (S) accounts may be assigned throughout the same day without duplicate or overlap blocking.</p>`
}
window.refreshAssignmentOptions=sid=>{
  const mid=$(`#min-${sid}`).value,roleSel=$(`#role-${sid}`),roles=visibleRoles(mid);
  roleSel.innerHTML=roles.length?roles.map(r=>`<option value="${r.id}" data-name="${esc(r.name)}">${esc(r.name)}</option>`).join(''):'<option value="">No roles configured</option>';
  refreshVolunteerOptions(sid);
};
window.refreshVolunteerOptions=sid=>{
  const mid=$(`#min-${sid}`).value,rid=$(`#role-${sid}`).value,volSel=$(`#vol-${sid}`),users=qualifiedUsers(mid,rid);
  volSel.innerHTML=users.length?users.map(u=>`<option value="${u.id}">${esc(u.name||u.email)}</option>`).join(''):'<option value="">No qualified volunteers</option>';
};
window.saveService=async()=>{const id=$('#serviceId').value,data={title:$('#serviceTitle').value.trim(),date:$('#serviceDate').value,start:$('#serviceStart').value,end:$('#serviceEnd').value,location:$('#serviceLocation').value.trim(),status:$('#serviceStatus').value,notes:$('#serviceNotes').value.trim(),archived:false,updatedAt:serverTimestamp()};if(!data.title||!data.date||!data.start)return alert('Complete service name, date, and time.');if(id)await updateDoc(doc(db,'services',id),data);else await addDoc(collection(db,'services'),{...data,createdAt:serverTimestamp()});clearServiceForm()};
window.editService=id=>{const s=state.services.find(x=>x.id===id);$('#serviceId').value=id;$('#serviceTitle').value=s.title||'';$('#serviceDate').value=s.date||'';$('#serviceStart').value=s.start||'';$('#serviceEnd').value=s.end||'';$('#serviceLocation').value=s.location||'';$('#serviceStatus').value=s.status||'scheduled';$('#serviceNotes').value=s.notes||'';window.scrollTo({top:0,behavior:'smooth'})};window.clearServiceForm=()=>renderSchedule();
window.duplicateService=async id=>{const s=state.services.find(x=>x.id===id);const newDate=prompt('New service date (YYYY-MM-DD):',s.date);if(!newDate)return;const ref=await addDoc(collection(db,'services'),{title:s.title,date:newDate,start:s.start,end:s.end,location:s.location,status:'scheduled',notes:s.notes||'',archived:false,createdAt:serverTimestamp()});const copy=confirm('Copy volunteer assignments too?');if(copy){for(const a of serviceAssignments(id))await addDoc(collection(db,'assignments'),{serviceId:ref.id,volunteerId:a.volunteerId,volunteerName:a.volunteerName,ministryId:a.ministryId,roleName:a.roleName,createdAt:serverTimestamp()})}alert('Service duplicated.')};
window.archiveService=id=>updateDoc(doc(db,'services',id),{archived:true});window.deleteService=async id=>{if(confirm('Permanently delete this service?'))await deleteDoc(doc(db,'services',id))};
window.addAssignment=async sid=>{
  const uid=$(`#vol-${sid}`).value,mid=$(`#min-${sid}`).value,rid=$(`#role-${sid}`).value;
  const role=state.roles.find(r=>r.id===rid),u=state.users.find(x=>x.id===uid),service=state.services.find(s=>s.id===sid);
  if(!mid||!rid)return alert('Select a ministry and role.');
  if(!uid)return alert('No qualified volunteer is available for this ministry and role. Assign the qualification in Admin → Manage Users first.');
  const volunteerS=isVolunteerSUser(uid);
  if(!volunteerS && serviceAssignments(sid).some(a=>a.volunteerId===uid&&a.ministryId===mid&&a.roleId===rid&&!a.archived))return alert('This exact volunteer, ministry, and role assignment already exists for this service.');
  if(!volunteerS){
    const conflicts=volunteerConflicts(uid,sid);
    const blocked=conflicts.filter(c=>c.minutes>MAX_ALLOWED_OVERLAP_MINUTES);
    if(blocked.length){
      const detail=blocked.map(c=>`${c.service.title||'Service'} (${timeLabel(c.service.start)}–${timeLabel(c.service.end)}): ${c.minutes} minute overlap`).join('\n');
      return alert(`Cannot schedule ${u?.name||u?.email||'this volunteer'}. The allowed overlap is ${MAX_ALLOWED_OVERLAP_MINUTES} minutes or less.\n\n${detail}`);
    }
    const allowed=conflicts.filter(c=>c.minutes>0);
    if(allowed.length){
      const detail=allowed.map(c=>`${c.service.title||'Service'}: ${c.minutes} minute overlap`).join('\n');
      const proceed=confirm(`This volunteer has a small schedule overlap, but it is within the ${MAX_ALLOWED_OVERLAP_MINUTES}-minute allowance.\n\n${detail}\n\nSchedule anyway?`);
      if(!proceed)return;
    }
  }
  await addDoc(collection(db,'assignments'),{serviceId:sid,volunteerId:uid,volunteerName:u?.name||u?.email||'Volunteer',ministryId:mid,roleId:rid,roleName:role?.name||'Volunteer',createdAt:serverTimestamp()});
};window.removeAssignment=id=>deleteDoc(doc(db,'assignments',id));

function peopleStats(){
  const users=state.users;
  return {
    total:users.length,
    admins:users.filter(u=>u.role==='admin').length,
    coordinators:users.filter(u=>u.role==='coordinator').length,
    volunteers:users.filter(u=>u.role==='volunteer').length,
    volunteerS:users.filter(u=>u.role==='volunteerS').length
  };
}
function peopleFiltered(){
  const term=peopleUI.search.trim().toLowerCase();
  return [...state.users]
    .filter(u=>peopleUI.role==='all'||u.role===peopleUI.role)
    .filter(u=>peopleUI.status==='all'||(u.status||'active')===peopleUI.status)
    .filter(u=>!term||[u.name,u.email,roleLabel(u.role)].some(v=>String(v||'').toLowerCase().includes(term)))
    .sort((a,b)=>String(a.name||a.email).localeCompare(String(b.name||b.email)));
}
function peopleInitials(u){
  const source=String(u.name||u.email||'?').trim();
  const parts=source.split(/[\s._-]+/).filter(Boolean);
  return esc((parts.length>1?parts[0][0]+parts[parts.length-1][0]:source.slice(0,2)).toUpperCase());
}
function peopleRoleBadge(role){
  return `<span class="peopleRole peopleRole-${esc(role||'pending')}">${esc(roleLabel(role))}</span>`;
}
function renderPeopleDirectory(){
  const stats=peopleStats();
  return `<div class="peopleDirectory">
    <div class="peopleStats">
      <div><span>Total People</span><b>${stats.total}</b></div>
      <div><span>Admins</span><b>${stats.admins}</b></div>
      <div><span>Coordinators</span><b>${stats.coordinators}</b></div>
      <div><span>Volunteers</span><b>${stats.volunteers}</b></div>
      <div><span>Volunteer (S)</span><b>${stats.volunteerS}</b></div>
    </div>
    <div class="peopleToolbar">
      <label class="peopleSearch"><span>⌕</span><input value="${esc(peopleUI.search)}" placeholder="Search name, email, or role..." oninput="peopleSearch(this.value)"></label>
      <select onchange="peopleRoleFilter(this.value)">
        <option value="all">All Roles</option>
        ${['admin','coordinator','volunteer','volunteerS','scheduleViewer','pending'].map(r=>`<option value="${r}" ${peopleUI.role===r?'selected':''}>${esc(roleLabel(r))}</option>`).join('')}
      </select>
      <select onchange="peopleStatusFilter(this.value)">
        <option value="all">All Status</option>
        <option value="active" ${peopleUI.status==='active'?'selected':''}>Active</option>
        <option value="pending" ${peopleUI.status==='pending'?'selected':''}>Pending</option>
      </select>
    </div>
    <div id="peopleTableWrap">${renderPeopleTable()}</div>
  </div>`;
}
function renderPeopleTable(){
  const filtered=peopleFiltered();
  const pages=Math.max(1,Math.ceil(filtered.length/peopleUI.pageSize));
  if(peopleUI.page>pages)peopleUI.page=pages;
  const start=(peopleUI.page-1)*peopleUI.pageSize;
  const rows=filtered.slice(start,start+peopleUI.pageSize);
  return `<div class="peopleTableScroller"><table class="peopleTable">
    <thead><tr><th>Name</th><th>Email</th><th>Account Type</th><th>Ministry Roles</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${rows.length?rows.map(peopleTableRow).join(''):`<tr><td colspan="6" class="peopleEmpty">No matching people.</td></tr>`}</tbody>
  </table></div>
  <div class="peoplePager">
    <div><select onchange="peoplePageSize(this.value)"><option value="10" ${peopleUI.pageSize===10?'selected':''}>10</option><option value="20" ${peopleUI.pageSize===20?'selected':''}>20</option><option value="50" ${peopleUI.pageSize===50?'selected':''}>50</option></select><span>Showing ${filtered.length?start+1:0} to ${Math.min(start+peopleUI.pageSize,filtered.length)} of ${filtered.length} people</span></div>
    <div><button onclick="peoplePage(${peopleUI.page-1})" ${peopleUI.page<=1?'disabled':''}>Previous</button><span class="peoplePageNumber">${peopleUI.page}</span><button onclick="peoplePage(${peopleUI.page+1})" ${peopleUI.page>=pages?'disabled':''}>Next</button></div>
  </div>`;
}
function peopleTableRow(u){
  const roles=userQualifications(u).reduce((n,q)=>n+(q.roleIds?.length||0),0);
  const status=u.status||'active';
  return `<tr>
    <td><div class="peopleIdentity"><span class="peopleAvatar">${peopleInitials(u)}</span><div><b>${esc(u.name||u.email)}</b><small>${esc(u.email||'')}</small></div></div></td>
    <td>${esc(u.email||'—')}</td>
    <td>${peopleRoleBadge(u.role)}</td>
    <td><b>${roles}</b></td>
    <td><span class="peopleStatus peopleStatus-${esc(status)}">● ${esc(status[0].toUpperCase()+status.slice(1))}</span></td>
    <td><div class="peopleActions"><button title="Edit display name" onclick="editPersonName('${u.id}')">✎</button><button title="Manage user and qualifications" onclick="openUserManager('${u.id}')">♙</button></div></td>
  </tr>`;
}
function refreshPeopleTable(){
  const wrap=document.getElementById('peopleTableWrap');
  if(wrap)wrap.innerHTML=renderPeopleTable();
}
window.peopleSearch=value=>{peopleUI.search=value;peopleUI.page=1;refreshPeopleTable()};
window.peopleRoleFilter=value=>{peopleUI.role=value;peopleUI.page=1;refreshPeopleTable()};
window.peopleStatusFilter=value=>{peopleUI.status=value;peopleUI.page=1;refreshPeopleTable()};
window.peoplePageSize=value=>{peopleUI.pageSize=Number(value)||10;peopleUI.page=1;refreshPeopleTable()};
window.peoplePage=page=>{const pages=Math.max(1,Math.ceil(peopleFiltered().length/peopleUI.pageSize));peopleUI.page=Math.min(Math.max(1,page),pages);refreshPeopleTable()};
window.editPersonName=async uid=>{
  const user=state.users.find(u=>u.id===uid);
  if(!user)return alert('User account was not found.');
  const name=prompt('Enter the display name:',user.name||'');
  if(name===null)return;
  const clean=name.trim();
  if(!clean)return alert('Enter a display name.');
  try{
    await updateDoc(doc(db,'users',uid),{name:clean,updatedAt:serverTimestamp()});
    const matches=await getDocs(query(collection(db,'assignments'),where('volunteerId','==',uid)));
    await Promise.all(matches.docs.map(item=>updateDoc(item.ref,{volunteerName:clean,updatedAt:serverTimestamp()})));
    alert(`Display name updated to “${clean}”.`);
  }catch(e){
    console.error('Unable to update display name:',e);
    alert(friendly(e));
  }
};
window.openUserManager=uid=>{
  adminOpenSections.add('users');
  const details=document.getElementById('manageUsersSection');
  if(details)details.open=true;
  setTimeout(()=>{
    const card=document.getElementById(`user-card-${uid}`);
    if(card){
      card.scrollIntoView({behavior:'smooth',block:'center'});
      card.classList.add('peopleFocus');
      setTimeout(()=>card.classList.remove('peopleFocus'),1600);
    }
  },80);
};


document.addEventListener('toggle',event=>{
  const details=event.target;
  if(!(details instanceof HTMLDetailsElement))return;

  if(details.id==='admin-section-people'){
    details.open?adminOpenSections.add('people'):adminOpenSections.delete('people');
  }else if(details.id==='manageUsersSection'){
    details.open?adminOpenSections.add('users'):adminOpenSections.delete('users');
  }else if(details.id==='admin-section-ministries'){
    details.open?adminOpenSections.add('ministries'):adminOpenSections.delete('ministries');
  }

  if(details.classList.contains('qualificationPanel')){
    const uid=details.dataset.userId;
    if(uid){
      details.open?qualificationOpenUsers.add(uid):qualificationOpenUsers.delete(uid);
    }
  }
},true);


function renderAdmin(){
  const pending=state.users.filter(u=>u.role==='pending'||u.status==='pending');
  $('#main').innerHTML=`
    <div class="dash">
      <div class="stat"><span>Users</span><b>${state.users.length}</b></div>
      <div class="stat"><span>Pending</span><b>${pending.length}</b></div>
      <div class="stat"><span>Ministries</span><b>${state.ministries.length}</b></div>
      <div class="stat"><span>Services</span><b>${state.services.length}</b></div>
    </div>

    <div class="card">
      <div class="demoPeopleHeader">
        <div><h2>Pending Accounts</h2><p class="small">Create test people for checking the People directory and approval workflow.</p></div>
        <button onclick="generateDemoPeople()">Generate 20 Demo People</button>
      </div>
      ${pending.map(userCard).join('')||'<p class="small">No pending accounts.</p>'}
    </div>

    <details id="admin-section-people" class="card adminSection" ${adminOpenSections.has('people')?'open':''}>
      <summary>
        <span><b>People</b><small>${state.users.length} account(s) • edit display names</small></span>
        <span class="adminChevron">⌄</span>
      </summary>
      <div class="adminSectionBody">${renderPeopleDirectory()}</div>
    </details>

    <details id="manageUsersSection" class="card adminSection" ${adminOpenSections.has('users')?'open':''}>
      <summary>
        <span><b>Manage Users & Qualifications</b><small>Roles, approvals, and ministry qualifications</small></span>
        <span class="adminChevron">⌄</span>
      </summary>
      <div class="adminSectionBody">${state.users.map(userCard).join('')}</div>
    </details>

    <details id="admin-section-ministries" class="card adminSection" ${adminOpenSections.has('ministries')?'open':''}>
      <summary>
        <span><b>Manage Ministries & Roles</b><small>${state.ministries.length} ministry/ministries</small></span>
        <span class="adminChevron">⌄</span>
      </summary>
      <div class="adminSectionBody">
        ${state.ministries.map(ministryCard).join('')||'<p class="small">No ministries yet.</p>'}
        <div class="row"><input id="newMinistry" placeholder="New ministry name"><button onclick="addMinistry()">Add Ministry</button></div>
      </div>
    </details>`;
}

window.generateDemoPeople=async()=>{
  if(!isAdmin())return alert('Only admins can generate demo people.');
  const existing=state.users.filter(u=>u.demo===true);
  if(existing.length){
    const ok=confirm(`${existing.length} demo people already exist. Create 20 more?`);
    if(!ok)return;
  }
  const stamp=Date.now();
  try{
    for(let i=1;i<=20;i++){
      const n=String(i).padStart(2,'0');
      const ref=doc(collection(db,'users'));
      await setDoc(ref,{
        name:`Demo Volunteer ${n}`,
        email:`demo.volunteer.${n}.${stamp}@demo.local`,
        role:'pending',
        status:'pending',
        qualifications:[],
        ministryIds:[],
        demo:true,
        demoBatch:String(stamp),
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
    }
    alert('20 demo people created. All accounts are Pending.');
  }catch(e){
    console.error('Unable to generate demo people:',e);
    alert(friendly(e));
  }
};

function userCard(u){
  const canQualify=['volunteer','volunteerS','coordinator','admin'].includes(u.role);
  return `<div id="user-card-${u.id}" class="person userCard"><div><b>${esc(u.name||u.email)}</b><div class="small">${esc(u.email||'')} • ${esc(roleLabel(u.role))}</div>${canQualify?`<div class="small">${userQualifications(u).reduce((n,q)=>n+(q.roleIds?.length||0),0)} ministry role(s) assigned</div>`:''}</div><div class="actions"><select id="role-${u.id}"><option value="pending" ${u.role==='pending'?'selected':''}>Pending</option><option value="scheduleViewer" ${u.role==='scheduleViewer'?'selected':''}>Schedule Viewer</option><option value="volunteer" ${u.role==='volunteer'?'selected':''}>Volunteer</option><option value="volunteerS" ${u.role==='volunteerS'?'selected':''}>Volunteer (S)</option><option value="coordinator" ${u.role==='coordinator'?'selected':''}>Coordinator</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select><button onclick="saveUserRole('${u.id}')">Save Role</button></div></div>${canQualify?qualificationEditor(u):''}`
}
function qualificationEditor(u){
  return `<details class="qualificationPanel" data-user-id="${u.id}" ${qualificationOpenUsers.has(u.id)?'open':''}><summary>Manage Ministry & Role Qualifications</summary><div class="qualificationBody"><p class="small">Choose every ministry role this person is trained or approved to serve in.</p>${visibleMinistries().map(m=>{const roles=visibleRoles(m.id);return `<div class="qualificationMinistry"><h3>${esc(m.name)}</h3>${roles.length?roles.map(r=>`<label class="qualificationChoice"><input type="checkbox" id="qual-${u.id}-${r.id}" ${isQualifiedFor(u,m.id,r.id)?'checked':''}> <span>${esc(r.name)}</span></label>`).join(''):'<p class="small">No roles configured for this ministry.</p>'}</div>`}).join('')}<button onclick="saveQualifications('${u.id}')">Save Ministry Roles</button></div></details>`
}
window.saveQualifications=async uid=>{
  const qualifications=visibleMinistries().map(m=>({ministryId:m.id,roleIds:visibleRoles(m.id).filter(r=>document.getElementById(`qual-${uid}-${r.id}`)?.checked).map(r=>r.id)})).filter(q=>q.roleIds.length);
  try{await updateDoc(doc(db,'users',uid),{qualifications,updatedAt:serverTimestamp()});alert('Volunteer ministry roles saved.')}catch(e){alert(friendly(e))}
};
window.saveUserRole=async id=>{const role=$(`#role-${id}`).value;await updateDoc(doc(db,'users',id),{role,status:role==='pending'?'pending':'active'});alert('User role updated.')};
function ministryCard(m){const roles=state.roles.filter(r=>r.ministryId===m.id);return `<div class="statusBox"><div class="person"><div><b>${esc(m.name)}</b><div class="small">${m.archived?'Archived':(m.visible===false?'Hidden • Active':'Visible • Active')}</div></div><div class="actions"><button class="secondary" onclick="toggleMinistry('${m.id}',${m.visible===false})">${m.visible===false?'Show':'Hide'}</button><button class="secondary" onclick="renameMinistry('${m.id}')">Edit</button><button class="secondary" onclick="archiveMinistry('${m.id}')">Archive</button><button class="danger" onclick="deleteMinistry('${m.id}')">Delete</button></div></div><h3>Roles</h3>${roles.map(roleCard).join('')||'<p class="small">No roles yet.</p>'}<div class="row"><input id="newRole-${m.id}" placeholder="New role name"><button onclick="addRole('${m.id}')">Add Role</button><button class="secondary" onclick="addDefaultTechRoles('${m.id}')">Add Default Tech Roles</button></div></div>`}
function roleCard(r){return `<div class="person"><div><b>${esc(r.name)}</b><div class="small">${r.archived?'Archived':(r.visible===false?'Hidden • Active':'Visible • Active')}</div></div><div class="actions"><button class="secondary" onclick="toggleRole('${r.id}',${r.visible===false})">${r.visible===false?'Show':'Hide'}</button><button class="secondary" onclick="renameRole('${r.id}')">Edit</button><button class="secondary" onclick="archiveRole('${r.id}')">Archive</button><button class="danger" onclick="deleteRole('${r.id}')">Delete</button></div></div>`}
window.addMinistry=async()=>{const name=$('#newMinistry').value.trim();if(!name)return;await addDoc(collection(db,'ministries'),{name,visible:true,archived:false,sortOrder:state.ministries.length+1,createdAt:serverTimestamp()})};window.toggleMinistry=(id,show)=>updateDoc(doc(db,'ministries',id),{visible:show});window.renameMinistry=async id=>{const m=state.ministries.find(x=>x.id===id),name=prompt('Ministry name:',m.name);if(name)await updateDoc(doc(db,'ministries',id),{name})};window.archiveMinistry=id=>updateDoc(doc(db,'ministries',id),{archived:true,visible:false});window.deleteMinistry=async id=>{if(confirm('Permanently delete this ministry?'))await deleteDoc(doc(db,'ministries',id))};

window.addRole=async ministryId=>{
  const input=$(`#newRole-${ministryId}`);
  const name=input?.value.trim();
  if(!input)return alert('Role input was not found. Please refresh the page and try again.');
  if(!name)return alert('Enter a role name first.');
  try{
    await addDoc(collection(db,'roles'),{
      name,
      ministryId,
      visible:true,
      archived:false,
      sortOrder:state.roles.filter(r=>r.ministryId===ministryId).length+1,
      createdAt:serverTimestamp()
    });
    input.value='';
    alert(`Role “${name}” added.`);
  }catch(error){
    console.error('Unable to add role:',error);
    if(error?.code==='permission-denied'){
      alert('Permission denied. Publish the updated Firestore rules included with this release, then try again.');
    }else{
      alert(`Unable to add role: ${error?.message||'Unknown error'}`);
    }
  }
};
window.addDefaultTechRoles=async ministryId=>{const defaults=['ProPresenter','FOH','Lights','FB Sound','Camera Switcher'];const existing=new Set(state.roles.filter(r=>r.ministryId===ministryId).map(r=>String(r.name).toLowerCase()));for(const name of defaults){if(!existing.has(name.toLowerCase()))await addDoc(collection(db,'roles'),{name,ministryId,visible:true,archived:false,sortOrder:state.roles.filter(r=>r.ministryId===ministryId).length+1,createdAt:serverTimestamp()})}alert('Default tech roles added.')};
window.toggleRole=(id,show)=>updateDoc(doc(db,'roles',id),{visible:show});
window.renameRole=async id=>{const r=state.roles.find(x=>x.id===id),name=prompt('Role name:',r?.name||'');if(name)await updateDoc(doc(db,'roles',id),{name})};
window.archiveRole=id=>updateDoc(doc(db,'roles',id),{archived:true,visible:false});
window.deleteRole=async id=>{if(confirm('Permanently delete this role?'))await deleteDoc(doc(db,'roles',id))};

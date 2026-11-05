const $ = id => document.getElementById(id);
let patients=[], doctors=[], appointments=[];
const api = async (url, options={}) => {
  const res = await fetch('/api'+url, {headers:{'Content-Type':'application/json'}, ...options});
  const data = await res.json();
  if(!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};
const esc = v => String(v ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2800)}
function actions(type,id){return `<div class="actions"><button class="small-btn" onclick="editRecord('${type}',${id})">Edit</button><button class="small-btn delete" onclick="removeRecord('${type}',${id})">Delete</button></div>`}
async function refresh(){
 try{
  [patients,doctors,appointments]=await Promise.all([api('/patients'),api('/doctors'),api('/appointments')]);
  $('patientCount').textContent=patients.length;$('doctorCount').textContent=doctors.length;$('appointmentCount').textContent=appointments.length;
  $('pendingCount').textContent=appointments.filter(a=>a.status==='Pending').length;
  renderPatients();renderDoctors();renderAppointments();populateFilters();
 }catch(e){toast(e.message+' — check your MySQL configuration.')}
}
function renderPatients(){
 $('patientsBody').innerHTML=patients.map(p=>`<tr><td>#${p.patient_id}</td><td><b>${esc(p.name)}</b></td><td>${esc(p.email)}</td><td>${esc(p.phone)}</td><td>${esc(p.gender)}</td><td>${esc(p.age)}</td><td>${actions('patients',p.patient_id)}</td></tr>`).join('')||'<tr><td colspan="7">No patient records yet. Add your first patient.</td></tr>';
}
function populateFilters(){
 const current=$('specialtyFilter').value;
 const specs=[...new Set(doctors.map(d=>d.specialization))].sort();
 $('specialtyFilter').innerHTML='<option value="">All specializations</option>'+specs.map(s=>`<option>${esc(s)}</option>`).join('');
 $('specialtyFilter').value=current;
}
function renderDoctors(){
 const q=$('doctorSearch').value.toLowerCase(),spec=$('specialtyFilter').value;
 const list=doctors.filter(d=>(!spec||d.specialization===spec)&&(`${d.name} ${d.specialization}`.toLowerCase().includes(q)));
 $('doctorsGrid').innerHTML=list.map(d=>`<article class="doctor-card"><div class="avatar">${esc(d.name.split(' ').filter(Boolean).slice(-1)[0][0]||'D')}</div><div><h3>${esc(d.name)}</h3><p>${esc(d.email||'Email not provided')}</p><p>${esc(d.phone||'Phone not provided')}</p><span class="tag">${esc(d.specialization)}</span><div style="margin-top:12px">${actions('doctors',d.doctor_id)}</div></div></article>`).join('')||'<p>No matching doctors found.</p>';
}
function renderAppointments(){
 $('appointmentsBody').innerHTML=appointments.map(a=>`<tr><td>#${a.appointment_id}</td><td>${esc(a.patient_name)}</td><td>${esc(a.doctor_name)}</td><td>${esc(a.specialization)}</td><td>${String(a.appointment_date).slice(0,10)}</td><td>${String(a.appointment_time).slice(0,5)}</td><td><select class="status ${esc(a.status)}" onchange="changeStatus(${a.appointment_id},this.value)">${['Pending','Confirmed','Completed','Cancelled'].map(s=>`<option ${a.status===s?'selected':''}>${s}</option>`).join('')}</select></td><td>${actions('appointments',a.appointment_id)}</td></tr>`).join('')||'<tr><td colspan="8">No appointments booked yet.</td></tr>';
}
function field(label,name,type='text',value='',opts=null,full=false){
 let input=opts?`<select name="${name}" required><option value="">Choose ${label.toLowerCase()}</option>${opts.map(o=>`<option value="${esc(o.value)}" ${String(o.value)===String(value)?'selected':''}>${esc(o.label)}</option>`).join('')}</select>`:`<input name="${name}" type="${type}" value="${esc(value)}" ${type==='number'?'min="0"':''} ${['name','email','phone','specialization','appointment_date','appointment_time'].includes(name)?'required':''}>`;
 return `<div class="field ${full?'full':''}"><label>${label}</label>${input}</div>`;
}
function showForm(title,html,submit){
 $('modalTitle').textContent=title;$('recordForm').innerHTML=`<div class="form-grid">${html}</div><div class="form-actions"><button type="button" class="secondary-btn" onclick="closeModal()">Cancel</button><button class="primary-btn">Save record</button></div>`;
 $('recordForm').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());try{await submit(data);closeModal();await refresh();toast('Saved successfully');}catch(err){toast(err.message)}};
 $('modal').classList.add('show');
}
function closeModal(){$('modal').classList.remove('show')}
function openPatient(p={}){showForm(p.patient_id?'Edit patient':'Add patient',field('Full name','name','text',p.name||'',null,true)+field('Email','email','email',p.email||'')+field('Phone','phone','tel',p.phone||'')+field('Gender','gender','text',p.gender||'', [{value:'Female',label:'Female'},{value:'Male',label:'Male'},{value:'Other',label:'Other'}])+field('Age','age','number',p.age??''),d=>api('/patients'+(p.patient_id?'/'+p.patient_id:''),{method:p.patient_id?'PUT':'POST',body:JSON.stringify(d)}));}
function openDoctor(d={}){showForm(d.doctor_id?'Edit doctor':'Add doctor',field('Doctor name','name','text',d.name||'',null,true)+field('Specialization','specialization','text',d.specialization||'')+field('Phone','phone','tel',d.phone||'')+field('Email','email','email',d.email||''),data=>api('/doctors'+(d.doctor_id?'/'+d.doctor_id:''),{method:d.doctor_id?'PUT':'POST',body:JSON.stringify(data)}));}
function openAppointment(a={}){
 if(!patients.length||!doctors.length){toast('Add at least one patient and one doctor first.');return}
 const pOpts=patients.map(p=>({value:p.patient_id,label:`${p.name} (#${p.patient_id})`}));
 const dOpts=doctors.map(d=>({value:d.doctor_id,label:`${d.name} — ${d.specialization}`}));
 showForm(a.appointment_id?'Edit appointment':'Book appointment',field('Patient','patient_id','',a.patient_id||'',pOpts,true)+field('Doctor','doctor_id','',a.doctor_id||'',dOpts,true)+field('Appointment date','appointment_date','date',a.appointment_date?String(a.appointment_date).slice(0,10):'')+field('Appointment time','appointment_time','time',a.appointment_time?String(a.appointment_time).slice(0,5):'')+field('Status','status','',a.status||'Pending',['Pending','Confirmed','Completed','Cancelled'].map(s=>({value:s,label:s})),true),data=>api('/appointments'+(a.appointment_id?'/'+a.appointment_id:''),{method:a.appointment_id?'PUT':'POST',body:JSON.stringify(data)}));
}
function editRecord(type,id){const map={patients:['patient_id',patients,openPatient],doctors:['doctor_id',doctors,openDoctor],appointments:['appointment_id',appointments,openAppointment]};const [key,list,fn]=map[type];const record=list.find(x=>x[key]===id);if(record)fn(record)}
async function removeRecord(type,id){if(!confirm('Delete this record? Related appointment records may also be deleted.'))return;try{await api(`/${type}/${id}`,{method:'DELETE'});await refresh();toast('Record deleted')}catch(e){toast(e.message)}}
async function changeStatus(id,status){try{await api('/appointments/'+id,{method:'PUT',body:JSON.stringify({status})});await refresh();toast('Appointment status updated')}catch(e){toast(e.message)}}
$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});
refresh();

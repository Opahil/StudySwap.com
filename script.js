// StudySwap frontend script — updated for redesigned UI
const api = (path, opts={}) => fetch('/api'+path, {headers:{'Content-Type':'application/json'}, ...opts})
  .then(async r=>{
    const ct = r.headers.get('content-type') || ''
    if(ct.includes('application/json')) return r.json()
    const text = await r.text()
    throw new Error('Expected JSON from ' + path + ' but received HTML (or non-JSON): ' + text.slice(0,120))
  })

const el = sel => document.querySelector(sel)
const tutorListEl = el('#tutor-list')
const bookListEl = el('#book-list')
const roomListEl = el('#room-list')

async function loadAll(){
  try{
    const [tutors, books, rooms] = await Promise.all([api('/tutors'), api('/books'), api('/rooms')])
    renderTutors(tutors || [])
    renderBooks(books || [])
    renderRooms(rooms || [])
  }catch(err){
    console.error('loadAll error', err)
    if(tutorListEl) tutorListEl.textContent = 'Unable to load tutors.'
    if(bookListEl) bookListEl.textContent = 'Unable to load books.'
    if(roomListEl) roomListEl.textContent = 'Unable to load rooms.'
  }
}

function renderTutors(list){
  if(!tutorListEl) return
  tutorListEl.innerHTML = ''
  if(!list.length){ tutorListEl.textContent = 'No tutors yet.'; return }
  const tpl = document.getElementById('tutor-item-tpl')
  list.forEach(t=>{
    const node = tpl.content.cloneNode(true)
    const titleEl = node.querySelector('.title')
    if(titleEl) titleEl.textContent = t.name || 'Unnamed'
    const subEl = node.querySelector('.sub')
    if(subEl) subEl.textContent = ((t.subject||'') + (t.bio? ' · '+t.bio : ''))
    const btn = node.querySelector('.hire-btn')
    if(btn) btn.addEventListener('click', ()=>hireTutor(t))
    tutorListEl.appendChild(node)
  })
}

function renderBooks(list){
  if(!bookListEl) return
  bookListEl.innerHTML = ''
  if(!list.length){ bookListEl.textContent = 'No books yet.'; return }
  const tpl = document.getElementById('book-item-tpl')
  list.forEach(b=>{
    const node = tpl.content.cloneNode(true)
    const titleEl = node.querySelector('.title')
    if(titleEl) titleEl.textContent = b.title || 'Untitled'
    const subEl = node.querySelector('.sub')
    if(subEl) subEl.textContent = (b.author||'Unknown') + (b.price? (' · ৳'+b.price) : ' · Exchange')
    const btn = node.querySelector('.buy-btn')
    if(btn) btn.addEventListener('click', ()=>buyBook(b))
    bookListEl.appendChild(node)
  })
}

function renderRooms(list){
  if(!roomListEl) return
  roomListEl.innerHTML = ''
  if(!list.length){ roomListEl.textContent = 'No rooms yet.'; return }
  const tpl = document.getElementById('room-item-tpl')
  list.forEach(r=>{
    const node = tpl.content.cloneNode(true)
    const titleEl = node.querySelector('.title')
    if(titleEl) titleEl.textContent = r.name || 'Room'
    const subEl = node.querySelector('.sub')
    if(subEl) subEl.textContent = (r.topic||'General') + ' · ' + (r.slots||0) + ' seats'
    const btn = node.querySelector('.join-btn')
    if(btn) btn.addEventListener('click', ()=>joinRoom(r))
    roomListEl.appendChild(node)
  })
}

async function hireTutor(tutor){
  try{
    const amt = prompt('Enter amount to pay (৳) to hire '+(tutor.name||'Tutor'))
    if(!amt) return
    const res = await api('/payments/bkash', {method:'POST', body:JSON.stringify({to:tutor.name, amount:amt, ref:'hire-'+Date.now()})})
    alert(res.message || 'Payment successful')
    loadAll()
  }catch(err){
    console.error('hireTutor error', err)
    alert('Payment failed: ' + (err.message||err))
  }
}

async function buyBook(book){
  try{
    if(!book.price){alert('Contact seller to exchange.');return}
    const res = await api('/payments/bkash', {method:'POST', body:JSON.stringify({to:book.seller||'seller', amount:book.price, ref:'book-'+Date.now()})})
    alert(res.message || 'Payment successful')
    loadAll()
  }catch(err){
    console.error('buyBook error', err)
    alert('Payment failed: ' + (err.message||err))
  }
}

function joinRoom(room){
  alert('Joining room: '+(room.name||'Room')+' (mock)')
}

const id = i => document.getElementById(i)
if(id('open-tutor-form')) id('open-tutor-form').addEventListener('click', async ()=>{
  const name = prompt('Your name')
  const subject = prompt('Subject you teach')
  if(!name||!subject) return
  try{ await api('/tutors', {method:'POST', body:JSON.stringify({name,subject,bio:''})}); loadAll() }
  catch(err){console.error(err); alert('Failed to create tutor: '+err.message)}
})

if(id('open-book-form')) id('open-book-form').addEventListener('click', async ()=>{
  const title = prompt('Book title')
  const author = prompt('Author')
  const price = prompt('Price in ৳ (leave blank to exchange)')
  if(!title||!author) return
  try{ await api('/books',{method:'POST', body:JSON.stringify({title,author,price:price?Number(price):0})}); loadAll() }
  catch(err){console.error(err); alert('Failed to add book: '+err.message)}
})

if(id('open-room-form')) id('open-room-form').addEventListener('click', async ()=>{
  const name = prompt('Room name')
  const topic = prompt('Topic')
  const slots = prompt('Slots')
  if(!name||!topic) return
  try{ await api('/rooms',{method:'POST', body:JSON.stringify({name,topic,slots:Number(slots)||10})}); loadAll() }
  catch(err){console.error(err); alert('Failed to create room: '+err.message)}
})

loadAll()

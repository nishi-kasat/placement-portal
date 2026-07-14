window.AdminSearchPage = {
  template: `<section class="card-glow panel p-4"><h2 class="section-title mb-3">Search Students, Companies & Drives</h2>
  <div class="row g-2 mb-3"><div class="col-md-9"><input v-model="q" class="form-control form-control-lg" placeholder="Search by name, company, or job title" @keyup.enter="search"></div><div class="col-md-3 d-grid"><button class="btn btn-primary btn-lg" @click="search">Search</button></div></div>
  <div class="row g-4">
    <div class="col-md-4">
      <h4 class="text-white-50">Students</h4>
      <ul class="list-group"><li v-for="s in students" :key="s.student_id" class="list-group-item bg-dark text-white border-secondary">{{ s.full_name }} - {{ s.branch }}</li></ul>
      <p v-if="!students.length" class="text-muted mt-2">No students found.</p>
    </div>
    <div class="col-md-4">
      <h4 class="text-white-50">Companies</h4>
      <ul class="list-group"><li v-for="c in companies" :key="c.company_id" class="list-group-item bg-dark text-white border-secondary">{{ c.company_name }} - {{ c.approval_status }}</li></ul>
      <p v-if="!companies.length" class="text-muted mt-2">No companies found.</p>
    </div>
    <div class="col-md-4">
      <h4 class="text-white-50">Placement Drives</h4>
      <ul class="list-group"><li v-for="d in drives" :key="d.drive_id" class="list-group-item bg-dark text-white border-secondary">{{ d.job_title }} ({{ d.company_name }}) - {{ d.status }}</li></ul>
      <p v-if="!drives.length" class="text-muted mt-2">No drives found.</p>
    </div>
  </div></section>`,
  setup(_, { emit }) {
    const q = Vue.ref(''); const students = Vue.ref([]); const companies = Vue.ref([]); const drives = Vue.ref([]);
    async function search(){ try{ const r = await window.api.get(`/admin/search?query=${encodeURIComponent(q.value)}`); students.value = r.students || []; companies.value = r.companies || []; drives.value = r.drives || []; } catch(e){ emit('error', e.message); } }
    return { q, students, companies, drives, search };
  }
};

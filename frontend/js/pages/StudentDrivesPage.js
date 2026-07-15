window.StudentDrivesPage = {
  template: `
<section class="card-glow panel p-4">
  <h2 class="section-title mb-3">Search Placement Drives</h2>
  <div class="row g-2 mb-4 align-items-end">
    <div class="col-md-9">
      <label class="form-label text-white mb-1" for="drive-search">Role / Job Title</label>
      <input id="drive-search" v-model="q" @keyup.enter="search" class="form-control form-control-lg" placeholder="Search by role name or job title" />
    </div>
    <div class="col-md-3 d-grid">
      <button class="btn btn-primary btn-lg" @click="search">Search</button>
    </div>
  </div>

  <div class="mb-3 text-muted">
    <span v-if="q">Showing {{ drives.length }} result(s) for "{{ q }}".</span>
    <span v-else>Showing all approved drives.</span>
  </div>

  <div class="row g-3">
    <div class="col-lg-4" v-for="d in drives" :key="d.drive_id">
      <div class="card-glow panel-soft p-3 h-100 d-flex flex-column justify-content-between">
        <div>
          <h4>{{ d.job_title }}</h4>
          <h6 class="text-info mb-2">{{ d.company_name }}</h6>
          <p>{{ d.job_description }}</p>
          <ul class="mb-3">
            <li>Branch: {{ d.eligibility_branch || 'Any' }}</li>
            <li>CGPA: {{ d.eligibility_cgpa || '0' }}+</li>
            <li>Year: {{ d.eligibility_year || 'Any' }}</li>
            <li>Deadline: {{ d.application_deadline || 'N/A' }}</li>
          </ul>
        </div>
        <button
          type="button"
          :class="applied[d.drive_id] ? 'btn btn-secondary' : (isDeadlinePassed(d.application_deadline) ? 'btn btn-secondary' : 'btn btn-primary')"
          :disabled="applied[d.drive_id] || isDeadlinePassed(d.application_deadline)"
          @click="apply(d.drive_id)"
        >
          {{ applied[d.drive_id] ? 'Applied' : (isDeadlinePassed(d.application_deadline) ? 'Deadline Passed' : 'Apply') }}
        </button>
      </div>
    </div>
    <div class="col-12" v-if="!drives.length">
      <div class="panel-soft p-4 text-muted">No approved drives match your search.</div>
    </div>
  </div>
</section>
    `,
  setup(_, { emit }) {
    const q = Vue.ref('');
    const drives = Vue.ref([]);
    const allDrives = Vue.ref([]);
    const applied = Vue.reactive({});

    async function refreshApplied() {
      const d = await window.api.get('/student/dashboard');
      Object.keys(applied).forEach((k) => delete applied[k]);
      for (const a of d.applications || []) {
        applied[a.drive_id] = true;
      }
    }

    async function loadDrives() {
      const d = await window.api.get('/student/dashboard');
      allDrives.value = d.drives || [];
      drives.value = allDrives.value;
    }

    async function init() {
      try {
        await loadDrives();
        await refreshApplied();
      } catch (e) {
        emit('error', e.message);
      }
    }

    function search() {
      const query = q.value.toLowerCase().trim();
      drives.value = query
        ? allDrives.value.filter((d) =>
          (d.job_title || '').toLowerCase().includes(query) ||
          (d.job_description || '').toLowerCase().includes(query) ||
          (d.company_name || '').toLowerCase().includes(query)
        )
        : allDrives.value;
    }

    async function apply(driveId) {
      try {
        await window.api.post(`/student/apply/${driveId}`, {});
        emit('flash', 'Application submitted');
        await init();
      } catch (e) {
        emit('error', e.message);
      }
    }

    function isDeadlinePassed(dateStr) {
      if (!dateStr) return false;
      let cleanStr = dateStr.trim();
      if (cleanStr.length === 10) {
        cleanStr += 'T23:59:59';
      }
      const deadline = new Date(cleanStr);
      const now = new Date();
      return now > deadline;
    }

    Vue.onMounted(init);

    return { q, drives, applied, search, apply, isDeadlinePassed };
  }
};

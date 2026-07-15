window.CompanyDrivesPage = {
  template: `
  <section class="card-glow panel p-4">
    <h2 class="section-title mb-4">My Placement Drives</h2>
    <div class="table-responsive">
      <table class="table table-dark-custom align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Applicants</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in drives" :key="d.drive_id">
            <td>#{{ d.drive_id }}</td>
            <td class="fw-bold">{{ d.job_title }}</td>
            <td>{{ d.applicants }}</td>
            <td>
              <span class="badge" :class="statusClass(d.status)">{{ d.status }}</span>
            </td>
            <td>
              <button v-if="d.status === 'approved' || d.status === 'pending'" class="btn btn-danger btn-sm" @click="closeDrive(d.drive_id)">
                Close Drive
              </button>
              <span v-else class="text-white-50 small">-</span>
            </td>
          </tr>
          <tr v-if="drives.length === 0">
            <td colspan="5" class="text-center text-white-50 py-4">No placement drives found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>`,
  setup(_, { emit }) {
    const drives = Vue.ref([]);

    async function loadDrives() {
      try {
        const d = await window.api.get('/company/dashboard');
        drives.value = d.drives || [];
      } catch (e) {
        emit('error', e.message);
      }
    }

    async function closeDrive(driveId) {
      if (!confirm("Are you sure you want to close this drive? Students will no longer be able to apply.")) {
        return;
      }
      try {
        await window.api.post('/company/close_drive/' + driveId);
        emit('flash', 'Placement drive closed successfully');
        await loadDrives();
      } catch (e) {
        emit('error', e.message);
      }
    }

    function statusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'bg-success text-white';
      if (s === 'closed') return 'bg-secondary text-white';
      if (s === 'rejected') return 'bg-danger text-white';
      return 'bg-warning text-dark';
    }

    Vue.onMounted(loadDrives);

    return { drives, closeDrive, statusClass };
  }
};

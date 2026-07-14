window.AdminDrivesPage = {
  template: `<section class="card-glow panel p-4">
    <h2 class="section-title mb-3">Placement Drives</h2>
    <div class="table-responsive">
      <table class="table table-dark-custom align-middle">
        <thead>
          <tr>
            <th>Company</th>
            <th>Job</th>
            <th>Eligibility</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in drives" :key="d.drive_id">
            <td>{{ d.company_name }}</td>
            <td>{{ d.job_title }}</td>
            <td>{{ d.eligibility_branch }} / {{ d.eligibility_cgpa }} / {{ d.eligibility_year }}</td>
            <td>{{ d.application_deadline }}</td>
            <td>
              <span class="badge" :class="statusBadgeClass(d.status)">{{ d.status }}</span>
            </td>
            <td>
              <div class="d-flex gap-2">
                <template v-if="d.status === 'pending'">
                  <button class="btn btn-success btn-sm" @click="act('approve_drive', d.drive_id)">Approve</button>
                  <button class="btn btn-warning btn-sm" @click="act('reject_drive', d.drive_id)">Reject</button>
                </template>
                <template v-else-if="d.status === 'approved'">
                  <button class="btn btn-danger btn-sm" @click="confirmClose(d.drive_id)">Close Drive</button>
                </template>
                <template v-else>
                  <span class="text-white-50 small">-</span>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>`,
  setup(_, { emit }) {
    const drives = Vue.ref([]);
    
    async function load() { 
      try { 
        drives.value = await window.api.get('/admin/drives'); 
      } catch (e) { 
        emit('error', e.message); 
      } 
    }
    
    async function act(route, id) { 
      try { 
        await window.api.post(`/admin/${route}/${id}`, {}); 
        emit('flash', 'Action successful'); 
        await load(); 
      } catch (e) { 
        emit('error', e.message); 
      } 
    }

    async function confirmClose(driveId) {
      if (confirm("Are you sure you want to close this placement drive? Students will no longer be able to apply.")) {
        await act('close_drive', driveId);
      }
    }

    function statusBadgeClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'approved') return 'bg-success text-white';
      if (s === 'closed') return 'bg-secondary text-white';
      if (s === 'rejected') return 'bg-danger text-white';
      return 'bg-warning text-dark';
    }

    Vue.onMounted(load); 
    return { drives, act, confirmClose, statusBadgeClass };
  }
};

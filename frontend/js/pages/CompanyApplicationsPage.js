window.CompanyApplicationsPage = {
  template: `<section class="card-glow panel p-4"><h2 class="section-title mb-3">Drive Applications</h2>
  <div class="row g-2 mb-3"><div class="col-md-8"><select v-model="driveId" class="form-select form-select-lg"><option disabled value="">Select drive</option><option v-for="d in drives" :value="d.drive_id" :key="d.drive_id">#{{ d.drive_id }} - {{ d.job_title }}</option></select></div><div class="col-md-4 d-grid"><button class="btn btn-primary btn-lg" @click="loadApps">Load Applications</button></div></div>
  <div class="table-responsive"><table class="table table-dark-custom align-middle"><thead><tr><th>Student</th><th>Status</th><th>Actions</th></tr></thead><tbody>
  <tr v-for="a in apps" :key="a.application_id">
    <td>
      <div class="fw-bold">{{ a.full_name }}</div>
      <div v-if="a.interview_date" class="small text-warning mt-1">
        Interview: {{ formatDateTime(a.interview_date) }}<br/>
        Details: {{ a.interview_details || '-' }}
      </div>
    </td>
    <td>{{ a.status }}</td>
    <td>
      <div class="d-flex gap-2">
        <button class="btn btn-warning btn-sm" @click="openSchedule(a)">Shortlist / Schedule</button>
        <button class="btn btn-success btn-sm" @click="setStatus(a.application_id, 'selected')">Select</button>
        <button class="btn btn-danger btn-sm" @click="setStatus(a.application_id, 'rejected')">Reject</button>
      </div>
      <div v-if="editingId === a.application_id" class="mt-2 p-2 border border-secondary rounded bg-dark" style="max-width: 400px;">
        <div class="row g-2">
          <div class="col-12">
            <label class="form-label text-white-50 small mb-1">Interview Date & Time</label>
            <input type="datetime-local" class="form-control form-control-sm text-dark bg-light" v-model="form.interview_date" />
          </div>
          <div class="col-12">
            <label class="form-label text-white-50 small mb-1">Location / Details</label>
            <input type="text" class="form-control form-control-sm text-dark bg-light" placeholder="e.g. Zoom link or Office room" v-model="form.interview_details" />
          </div>
          <div class="col-12 d-flex justify-content-end gap-2 mt-2">
            <button class="btn btn-sm btn-secondary" @click="editingId = null">Cancel</button>
            <button class="btn btn-sm btn-primary" @click="saveSchedule(a.application_id)">Save Schedule</button>
          </div>
        </div>
      </div>
    </td>
  </tr>
  </tbody></table></div></section>`,
  setup(_, { emit }) {
    const drives = Vue.ref([]); const driveId = Vue.ref(''); const apps = Vue.ref([]);
    const editingId = Vue.ref(null);
    const form = Vue.reactive({ interview_date: '', interview_details: '' });

    Vue.onMounted(async()=>{ try{ const d = await window.api.get('/company/dashboard'); drives.value = d.drives || []; } catch(e){ emit('error', e.message); } });
    async function loadApps(){ if(!driveId.value) return emit('error', 'Please select a drive'); try{ apps.value = await window.api.get(`/company/applications/${driveId.value}`); } catch(e){ emit('error', e.message); } }
    async function setStatus(id, status){ try{ await window.api.post(`/company/update_status/${id}`, { status }); emit('flash', `Application marked ${status}`); await loadApps(); } catch(e){ emit('error', e.message); } }

    function openSchedule(app) {
      editingId.value = app.application_id;
      // Convert raw SQLite format to datetime-local compatible format if existing
      form.interview_date = app.interview_date ? app.interview_date.replace(' ', 'T') : '';
      form.interview_details = app.interview_details || '';
    }

    async function saveSchedule(id) {
      try {
        const formattedDate = form.interview_date ? form.interview_date.replace('T', ' ') : '';
        await window.api.post(`/company/update_status/${id}`, {
          status: 'shortlisted',
          interview_date: formattedDate,
          interview_details: form.interview_details
        });
        emit('flash', 'Interview scheduled and applicant shortlisted');
        editingId.value = null;
        await loadApps();
      } catch (e) {
        emit('error', e.message);
      }
    }

    function formatDateTime(val) {
      if (!val) return '';
      return val.replace('T', ' ');
    }

    return { drives, driveId, apps, loadApps, setStatus, editingId, form, openSchedule, saveSchedule, formatDateTime };
  }
};

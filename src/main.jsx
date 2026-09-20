import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2,
  ChevronDown, CircleAlert, Clock3, LayoutDashboard, Pencil, Plus,
  Search, SlidersHorizontal, Trash2, UsersRound, X
} from 'lucide-react';
import './styles.css';

const initialProjects = [
  { id: 'p1', name: 'Northstar rollout', client: 'Arcade Health', owner: 'Maya Chen', status: 'On track', color: '#5b74df', budget: 92000, start: '2026-09-14', end: '2026-11-06' },
  { id: 'p2', name: 'Commerce platform', client: 'Harlow & Co.', owner: 'Theo Grant', status: 'At risk', color: '#dd8561', budget: 64000, start: '2026-09-21', end: '2026-11-27' },
  { id: 'p3', name: 'Data foundation', client: 'Alba Foods', owner: 'Maya Chen', status: 'On track', color: '#35a080', budget: 78000, start: '2026-09-07', end: '2026-12-04' },
  { id: 'p4', name: 'Service redesign', client: 'Noma Energy', owner: 'Priya Shah', status: 'Planning', color: '#9a75d9', budget: 47000, start: '2026-10-05', end: '2026-12-18' },
];

const initialResources = [
  { id: 'r1', name: 'Maya Chen', initials: 'MC', role: 'Delivery lead', capacity: 40, rate: 142, color: '#e8e1ff' },
  { id: 'r2', name: 'Theo Grant', initials: 'TG', role: 'Product designer', capacity: 36, rate: 118, color: '#dcecff' },
  { id: 'r3', name: 'Priya Shah', initials: 'PS', role: 'Technical architect', capacity: 40, rate: 154, color: '#dff3e9' },
  { id: 'r4', name: 'Jon Bell', initials: 'JB', role: 'Implementation consultant', capacity: 32, rate: 108, color: '#ffe9d9' },
  { id: 'r5', name: 'Ari Brooks', initials: 'AB', role: 'Data analyst', capacity: 40, rate: 126, color: '#f3e1ee' },
];

const initialAllocations = [
  { id: 'a1', resourceId: 'r1', projectId: 'p1', hours: 22 }, { id: 'a2', resourceId: 'r1', projectId: 'p3', hours: 16 },
  { id: 'a3', resourceId: 'r2', projectId: 'p1', hours: 24 }, { id: 'a4', resourceId: 'r2', projectId: 'p2', hours: 12 },
  { id: 'a5', resourceId: 'r3', projectId: 'p1', hours: 18 }, { id: 'a6', resourceId: 'r3', projectId: 'p3', hours: 22 },
  { id: 'a7', resourceId: 'r4', projectId: 'p2', hours: 20 }, { id: 'a8', resourceId: 'r4', projectId: 'p4', hours: 10 },
  { id: 'a9', resourceId: 'r5', projectId: 'p3', hours: 28 }, { id: 'a10', resourceId: 'r5', projectId: 'p4', hours: 8 },
];

const initialEntries = [
  { id: 't1', resourceId: 'r1', projectId: 'p1', date: '2026-09-15', hours: 6.5, note: 'Sprint planning and client review' },
  { id: 't2', resourceId: 'r2', projectId: 'p1', date: '2026-09-16', hours: 7, note: 'Order flow prototypes' },
  { id: 't3', resourceId: 'r3', projectId: 'p3', date: '2026-09-16', hours: 8, note: 'Data model workshop' },
  { id: 't4', resourceId: 'r4', projectId: 'p2', date: '2026-09-17', hours: 6, note: 'Configuration build' },
  { id: 't5', resourceId: 'r5', projectId: 'p3', date: '2026-09-18', hours: 7.5, note: 'Migration quality checks' },
  { id: 't6', resourceId: 'r1', projectId: 'p3', date: '2026-09-18', hours: 4, note: 'Steering pack preparation' },
];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const ganttWeeks = ['Sep 14', 'Sep 28', 'Oct 12', 'Oct 26', 'Nov 09', 'Nov 23', 'Dec 07', 'Dec 21'];
const ganttStart = new Date('2026-09-14T00:00:00');
const ganttEnd = new Date('2026-12-28T00:00:00');

function ganttStyle(start, end) {
  const range = ganttEnd - ganttStart;
  const startOffset = Math.max(0, new Date(`${start}T00:00:00`) - ganttStart);
  const endOffset = Math.min(range, new Date(`${end}T00:00:00`) - ganttStart);
  const left = Math.min(100, Math.max(0, startOffset / range * 100));
  const width = Math.max(4, Math.min(100 - left, (endOffset - startOffset) / range * 100));
  return { left: `${left}%`, width: `${width}%` };
}

function App() {
  const [view, setView] = useState('Overview');
  const [projects, setProjects] = useState(initialProjects);
  const [resources, setResources] = useState(initialResources);
  const [allocations, setAllocations] = useState(initialAllocations);
  const [entries, setEntries] = useState(initialEntries);
  const [modal, setModal] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [notice, setNotice] = useState('');

  const getResource = (id) => resources.find((resource) => resource.id === id);
  const getProject = (id) => projects.find((project) => project.id === id);
  const entryCost = (entry) => entry.hours * (getResource(entry.resourceId)?.rate || 0);
  const projectCost = (projectId) => entries.filter((entry) => entry.projectId === projectId).reduce((total, entry) => total + entryCost(entry), 0);
  const projectHours = (projectId) => entries.filter((entry) => entry.projectId === projectId).reduce((total, entry) => total + entry.hours, 0);
  const allocatedHours = (resourceId) => allocations.filter((item) => item.resourceId === resourceId).reduce((total, item) => total + item.hours, 0);
  const totalCost = entries.reduce((total, entry) => total + entryCost(entry), 0);
  const totalHours = entries.reduce((total, entry) => total + entry.hours, 0);
  const teamCapacity = resources.reduce((total, resource) => total + resource.capacity, 0);
  const teamPlanned = allocations.reduce((total, item) => total + item.hours, 0);

  function addProject(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const project = { id: `p${Date.now()}`, name: form.get('name'), client: form.get('client'), owner: form.get('owner'), budget: Number(form.get('budget')), start: form.get('start'), end: form.get('end'), status: 'Planning', color: '#5876d8' };
    setProjects((items) => [...items, project]);
    setModal(null);
    setNotice(`${project.name} is ready for resourcing.`);
  }

  function updateProject(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = form.get('start');
    const end = form.get('end');
    if (end < start) {
      setNotice('Project end date must be after the start date.');
      return;
    }
    const updated = { ...editingProject, name: form.get('name'), client: form.get('client'), owner: form.get('owner'), budget: Number(form.get('budget')), start, end, status: form.get('status') };
    setProjects((items) => items.map((project) => project.id === updated.id ? updated : project));
    setEditingProject(null);
    setModal(null);
    setNotice(`${updated.name} was updated.`);
  }

  function addResource(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name');
    const resource = { id: `r${Date.now()}`, name, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), role: form.get('role'), capacity: Number(form.get('capacity')), rate: Number(form.get('rate')), color: '#e5ebff' };
    setResources((items) => [...items, resource]);
    setModal(null);
    setNotice(`${resource.name} was added to the team.`);
  }

  function updateResource(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const capacity = Number(form.get('capacity'));
    const planned = allocatedHours(editingResource.id);
    if (capacity < planned) {
      setNotice(`Weekly capacity cannot be lower than the ${planned}h already allocated.`);
      return;
    }
    const name = form.get('name');
    const updated = { ...editingResource, name, initials: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), role: form.get('role'), capacity, rate: Number(form.get('rate')) };
    setResources((items) => items.map((resource) => resource.id === updated.id ? updated : resource));
    setEditingResource(null);
    setModal(null);
    setNotice(`${updated.name} was updated.`);
  }

  function addAllocation(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const resourceId = form.get('resourceId');
    const hours = Number(form.get('hours'));
    const remaining = (getResource(resourceId)?.capacity || 0) - allocatedHours(resourceId);
    if (hours > remaining) {
      setNotice(`Allocation exceeds the remaining ${remaining}h weekly capacity.`);
      return;
    }
    setAllocations((items) => [...items, { id: `a${Date.now()}`, resourceId, projectId: form.get('projectId'), hours }]);
    setModal(null);
    setNotice('Allocation added within the resource capacity cap.');
  }

  function addTime(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setEntries((items) => [{ id: `t${Date.now()}`, resourceId: form.get('resourceId'), projectId: form.get('projectId'), date: form.get('date'), hours: Number(form.get('hours')), note: form.get('note') }, ...items]);
    setModal(null);
    setNotice('Time entry added and costs refreshed.');
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><i></i><i></i><i></i></span><span>work<b>lane</b></span></div>
      <p className="workspace-label">WORKSPACE</p>
      <div className="workspace-switch"><span className="workspace-icon">AP</span><span><b>Acorn Partners</b><small>Delivery operations</small></span><ChevronDown size={15} /></div>
      <nav className="side-nav">
        <NavItem icon={<LayoutDashboard size={18} />} active={view === 'Overview'} onClick={() => setView('Overview')}>Overview</NavItem>
        <NavItem icon={<BriefcaseBusiness size={18} />} active={view === 'Projects'} onClick={() => setView('Projects')}>Projects</NavItem>
        <NavItem icon={<UsersRound size={18} />} active={view === 'Team'} onClick={() => setView('Team')}>Team</NavItem>
        <NavItem icon={<Clock3 size={18} />} active={view === 'Time logs'} onClick={() => setView('Time logs')}>Time logs</NavItem>
      </nav>
      <div className="sidebar-foot"><div className="mini-team">{resources.slice(0, 4).map((resource) => <span key={resource.id} style={{ background: resource.color }}>{resource.initials}</span>)}</div><span>5 team members</span></div>
    </aside>
    <main className="main-content">
      <header className="page-head"><div><p className="eyebrow">DELIVERY CONTROL CENTER</p><h1>{view === 'Overview' ? 'Good morning, Maya.' : view}</h1><p>{view === 'Overview' ? 'Here is the health of your delivery portfolio this week.' : 'Manage live delivery planning, capacity, and cost.'}</p></div><div className="head-actions"><button className="icon-button"><Search size={18} /></button><button className="icon-button"><CalendarDays size={18} /></button><button className="avatar">MC</button></div></header>
      {notice && <div className="notice"><CheckCircle2 size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Close notice"><X size={15} /></button></div>}
      {view === 'Overview' && <Overview projects={projects} resources={resources} allocations={allocations} entries={entries} totalCost={totalCost} totalHours={totalHours} teamCapacity={teamCapacity} teamPlanned={teamPlanned} getProject={getProject} getResource={getResource} projectCost={projectCost} projectHours={projectHours} onNewProject={() => setModal('project')} onLogTime={() => setModal('time')} />}
      {view === 'Projects' && <Projects projects={projects} resources={resources} allocations={allocations} entries={entries} getResource={getResource} projectCost={projectCost} projectHours={projectHours} onNewProject={() => setModal('project')} onAllocation={() => setModal('allocation')} onEditProject={(project) => { setEditingProject(project); setModal('editProject'); }} onDeleteProject={(projectId) => { const project = getProject(projectId); if (!window.confirm(`Delete ${project?.name}? Its allocations and time entries will also be removed.`)) return; setProjects((items) => items.filter((item) => item.id !== projectId)); setAllocations((items) => items.filter((item) => item.projectId !== projectId)); setEntries((items) => items.filter((item) => item.projectId !== projectId)); setNotice(`${project?.name} and its related delivery data were deleted.`); }} />}
      {view === 'Team' && <Team resources={resources} allocations={allocations} entries={entries} projects={projects} getProject={getProject} allocatedHours={allocatedHours} setResources={setResources} onNewResource={() => setModal('resource')} onAllocation={() => setModal('allocation')} onEditResource={(resource) => { setEditingResource(resource); setModal('editResource'); }} onDeleteResource={(resourceId) => { const resource = getResource(resourceId); if (!window.confirm(`Delete ${resource?.name}? Their allocations and time entries will also be removed.`)) return; setResources((items) => items.filter((item) => item.id !== resourceId)); setAllocations((items) => items.filter((item) => item.resourceId !== resourceId)); setEntries((items) => items.filter((item) => item.resourceId !== resourceId)); setNotice(`${resource?.name} and their related delivery data were deleted.`); }} />}
      {view === 'Time logs' && <TimeLogs entries={entries} getProject={getProject} getResource={getResource} entryCost={entryCost} totalCost={totalCost} totalHours={totalHours} onLogTime={() => setModal('time')} onDelete={(id) => { setEntries((items) => items.filter((entry) => entry.id !== id)); setNotice('Time entry deleted and costs refreshed.'); }} />}
    </main>
    {modal && <Modal title={modal === 'project' ? 'Create a project' : modal === 'editProject' ? 'Update project' : modal === 'resource' ? 'Add a delivery resource' : modal === 'editResource' ? 'Update delivery resource' : modal === 'allocation' ? 'Allocate a resource' : 'Log time'} onClose={() => { setModal(null); setEditingProject(null); setEditingResource(null); }}>
      {modal === 'project' && <ProjectForm onSubmit={addProject} />}
      {modal === 'editProject' && <ProjectForm project={editingProject} onSubmit={updateProject} />}
      {modal === 'resource' && <ResourceForm onSubmit={addResource} />}
      {modal === 'editResource' && <ResourceForm resource={editingResource} onSubmit={updateResource} />}
      {modal === 'allocation' && <AllocationForm resources={resources} projects={projects} allocatedHours={allocatedHours} onSubmit={addAllocation} />}
      {modal === 'time' && <TimeForm resources={resources} projects={projects} onSubmit={addTime} />}
    </Modal>}
  </div>;
}

function NavItem({ icon, active, onClick, children }) { return <button className={active ? 'active' : ''} onClick={onClick}>{icon}<span>{children}</span></button>; }

function Overview({ projects, resources, allocations, entries, totalCost, totalHours, teamCapacity, teamPlanned, getProject, getResource, projectCost, projectHours, onNewProject, onLogTime }) {
  const availability = teamCapacity - teamPlanned;
  const totalBudget = projects.reduce((total, project) => total + project.budget, 0);
  const budgetRemaining = totalBudget - totalCost;
  return <>
    <section className="metric-grid">
      <Metric label="Team capacity" value={`${teamPlanned} / ${teamCapacity}h`} sub={`${availability}h still available`} trend="This week" icon={<UsersRound />} />
      <Metric label="Hours logged" value={`${number.format(totalHours)}h`} sub="Across 6 time entries" trend="This week" icon={<Clock3 />} />
      <Metric label="Live delivery cost" value={money.format(totalCost)} sub="From approved time" trend="This week" icon={<BarChart3 />} />
      <Metric label="Active projects" value={projects.length} sub="1 needs attention" trend="Portfolio" icon={<BriefcaseBusiness />} alert />
    </section>
    <section className="dashboard-grid">
      <article className="card capacity-card"><CardHead eyebrow="TEAM PULSE" title="Capacity by person" action="View team" /><div className="capacity-list">{resources.map((resource) => { const planned = allocations.filter((allocation) => allocation.resourceId === resource.id).reduce((sum, item) => sum + item.hours, 0); const percentage = Math.min(100, Math.round(planned / resource.capacity * 100)); return <div className="capacity-row" key={resource.id}><Avatar resource={resource} /><div className="capacity-name"><b>{resource.name}</b><small>{resource.role}</small></div><div className="bar-wrap"><div className="bar-label"><span>{planned}h planned</span><b>{percentage}%</b></div><span className={`progress ${percentage > 90 ? 'warning' : ''}`}><i style={{ width: `${percentage}%` }}></i></span></div><span className="cap-total">{resource.capacity}h</span></div>; })}</div></article>
      <article className="card cost-card"><CardHead eyebrow="PORTFOLIO COST" title="Spend by project" action="Full portfolio" /><div className="donut-wrap"><div className="donut"><span><b>{money.format(totalCost)}</b><small>logged cost</small></span></div><div className="cost-legend">{projects.slice(0, 4).map((project) => <div key={project.id}><i style={{ background: project.color }}></i><span>{project.name}</span><b>{money.format(projectCost(project.id))}</b></div>)}</div></div><div className="budget-note"><CircleAlert size={16} /><span><b>{money.format(budgetRemaining)} budget remaining</b> across live projects</span></div></article>
    </section>
    <section className="card project-card"><CardHead eyebrow="PROJECT PORTFOLIO" title="Delivery at a glance" action="Manage projects" /><div className="project-table overview-table"><div className="table-head"><span>Project</span><span>Team</span><span>Hours logged</span><span>Live cost</span><span>Budget</span><span>Status</span></div>{projects.map((project) => { const team = allocations.filter((allocation) => allocation.projectId === project.id).map((allocation) => getResource(allocation.resourceId)); const cost = projectCost(project.id); return <div className="table-row" key={project.id}><div className="project-name"><i style={{ background: project.color }}></i><span><b>{project.name}</b><small>{project.client}</small></span></div><div className="table-avatars">{team.slice(0, 3).map((resource) => <Avatar key={resource.id} resource={resource} small />)}</div><span>{number.format(projectHours(project.id))}h</span><b>{money.format(cost)}</b><div className="budget-cell"><span className="thin-bar"><i style={{ width: `${Math.min(100, cost / project.budget * 100)}%`, background: project.color }}></i></span><small>{Math.round(cost / project.budget * 100)}% used</small></div><Status status={project.status} /></div>; })}</div></section>
    <section className="quick-actions"><div><p className="eyebrow">KEEP MOVING</p><h2>Update the delivery picture</h2><p>Every entry recalculates project, person, and portfolio costs in real time.</p></div><button className="secondary-button" onClick={onNewProject}><Plus size={17} />New project</button><button className="primary-button" onClick={onLogTime}><Clock3 size={17} />Log time</button></section>
  </>;
}

function Projects({ projects, resources, allocations, entries, getResource, projectCost, projectHours, onNewProject, onAllocation, onEditProject, onDeleteProject }) {
  const [query, setQuery] = useState('');
  const visibleProjects = projects.filter((project) => `${project.name} ${project.client} ${project.owner}`.toLowerCase().includes(query.toLowerCase()));
  return <>
  <div className="toolbar"><div className="filter-input"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" /></div><button className="secondary-button" onClick={onAllocation}><Plus size={16} />Allocate resource</button><button className="primary-button" onClick={onNewProject}><Plus size={16} />New project</button></div>
  <section className="portfolio-grid">{visibleProjects.map((project) => { const cost = projectCost(project.id); const team = allocations.filter((item) => item.projectId === project.id).map((item) => getResource(item.resourceId)); return <article className="portfolio-card" key={project.id}><div className="portfolio-top"><span className="color-dot" style={{ background: project.color }}></span><Status status={project.status} /><div className="project-actions"><button onClick={() => onEditProject(project)} aria-label={`Update ${project.name}`} title="Update project"><Pencil size={15} /></button><button className="project-delete" onClick={() => onDeleteProject(project.id)} aria-label={`Delete ${project.name}`} title="Delete project"><Trash2 size={16} /></button></div></div><h2>{project.name}</h2><p>{project.client}</p><div className="portfolio-meta"><span>Owner <b>{project.owner}</b></span><span>{number.format(projectHours(project.id))}h logged</span></div><div className="portfolio-cost"><small>Live cost</small><b>{money.format(cost)}</b><span>of {money.format(project.budget)}</span></div><span className="progress"><i style={{ width: `${Math.min(100, cost / project.budget * 100)}%`, background: project.color }}></i></span><div className="portfolio-foot"><div className="table-avatars">{team.map((resource) => <Avatar key={resource.id} resource={resource} small />)}</div><span>{team.length} assigned</span></div></article>; })}</section>
  <section className="card allocation-card"><CardHead eyebrow="RESOURCE PLAN" title="Weekly allocations" action="Capacity limits apply" /><div className="allocation-matrix"><div className="table-head"><span>Resource</span>{projects.slice(0, 4).map((project) => <span key={project.id}>{project.name}</span>)}<span>Available</span></div>{resources.map((resource) => { const planned = allocations.filter((item) => item.resourceId === resource.id); const sum = planned.reduce((total, item) => total + item.hours, 0); return <div className="matrix-row" key={resource.id}><div><Avatar resource={resource} small /><b>{resource.name}</b></div>{projects.slice(0, 4).map((project) => { const allocation = planned.find((item) => item.projectId === project.id); return <span key={project.id} className={allocation ? 'allocated' : ''}>{allocation ? `${allocation.hours}h` : '-'}</span>; })}<b className={sum > resource.capacity - 5 ? 'low-capacity' : ''}>{resource.capacity - sum}h</b></div>; })}</div></section>
  <ProjectGantt projects={projects} allocations={allocations} />
  </>; }

function Team({ resources, allocations, entries, projects, getProject, allocatedHours, setResources, onNewResource, onAllocation, onEditResource, onDeleteResource }) {
  const [query, setQuery] = useState('');
  const visibleResources = resources.filter((resource) => `${resource.name} ${resource.role}`.toLowerCase().includes(query.toLowerCase()));
  const resourceCost = (resourceId) => entries.filter((entry) => entry.resourceId === resourceId).reduce((total, entry) => total + entry.hours * (resources.find((resource) => resource.id === resourceId)?.rate || 0), 0);
  return <>
  <div className="toolbar"><div className="filter-input"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your team" /></div><button className="secondary-button" onClick={onAllocation}><Plus size={16} />Add allocation</button><button className="primary-button" onClick={onNewResource}><Plus size={16} />Add resource</button></div>
  <section className="card resource-card"><CardHead eyebrow="DELIVERY TEAM" title="People, capacity, and rate card" action="Weekly view" /><div className="resource-table"><div className="table-head"><span>Resource</span><span>Project allocations</span><span>Planned / cap</span><span>Hourly rate</span><span>Live cost</span><span>Availability</span><span></span></div>{visibleResources.map((resource) => { const assigned = allocations.filter((allocation) => allocation.resourceId === resource.id); const planned = allocatedHours(resource.id); const available = resource.capacity - planned; return <div className="resource-row" key={resource.id}><div className="resource-person"><Avatar resource={resource} /><span><b>{resource.name}</b><small>{resource.role}</small></span></div><div className="assignment-chips">{assigned.map((allocation) => <span key={allocation.id}>{getProject(allocation.projectId)?.name}<b>{allocation.hours}h</b></span>)}</div><div className="plan-cell"><b>{planned}h / {resource.capacity}h</b><span className="thin-bar"><i style={{ width: `${Math.min(100, planned / resource.capacity * 100)}%` }}></i></span></div><label className="rate-input"><span>$</span><input aria-label={`${resource.name} hourly rate`} type="number" value={resource.rate} onChange={(event) => setResources((items) => items.map((item) => item.id === resource.id ? { ...item, rate: Math.max(0, Number(event.target.value)) } : item))} /><small>/ hr</small></label><b className="live-cost">{money.format(resourceCost(resource.id))}</b><div className={available < 5 ? 'availability tight' : 'availability'}><b>{available}h</b><small>{available < 5 ? 'Nearly full' : 'available'}</small></div><div className="row-actions"><button onClick={() => onEditResource(resource)} aria-label={`Update ${resource.name}`} title="Update resource"><Pencil size={15} /></button><button className="project-delete" onClick={() => onDeleteResource(resource.id)} aria-label={`Delete ${resource.name}`} title="Delete resource"><Trash2 size={16} /></button></div></div>; })}</div></section>
  <section className="team-insight"><div><p className="eyebrow">CAPACITY GUARDRAIL</p><h2>Assignments respect individual caps.</h2><p>New allocations are checked against each resource's weekly capacity before they are added.</p></div><div className="guardrail-icon"><SlidersHorizontal size={28} /></div></section>
  <ResourceGantt resources={resources} projects={projects} allocations={allocations} />
  </>; }

function TimeLogs({ entries, getProject, getResource, entryCost, totalCost, totalHours, onLogTime, onDelete }) {
  const [query, setQuery] = useState('');
  const visibleEntries = entries.filter((entry) => `${getResource(entry.resourceId)?.name} ${getProject(entry.projectId)?.name} ${entry.note}`.toLowerCase().includes(query.toLowerCase()));
  return <>
  <div className="toolbar"><div className="filter-input"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search time logs" /></div><button className="secondary-button"><SlidersHorizontal size={16} />Filters</button><button className="primary-button" onClick={onLogTime}><Plus size={16} />Log time</button></div>
  <section className="report-grid"><article className="report-stat"><small>Logged time</small><b>{number.format(totalHours)}h</b><span>This reporting week</span></article><article className="report-stat"><small>Live cost</small><b>{money.format(totalCost)}</b><span>Based on resource rate cards</span></article><article className="report-stat"><small>Average rate</small><b>{money.format(totalCost / totalHours || 0)}</b><span>Per logged hour</span></article></section>
  <section className="card time-card"><CardHead eyebrow="TIME & COST REPORT" title="Individual time entries" action={`${visibleEntries.length} entries`} /><div className="time-table"><div className="table-head"><span>Date</span><span>Person</span><span>Project</span><span>Description</span><span>Hours</span><span>Rate</span><span>Cost</span><span></span></div>{visibleEntries.map((entry) => { const resource = getResource(entry.resourceId); const project = getProject(entry.projectId); return <div className="time-row" key={entry.id}><span>{new Date(`${entry.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><div><Avatar resource={resource} small /><b>{resource?.name}</b></div><div className="project-tag"><i style={{ background: project?.color }}></i>{project?.name}</div><span className="entry-note">{entry.note}</span><b>{number.format(entry.hours)}h</b><span>${resource?.rate}/h</span><b>{money.format(entryCost(entry))}</b><button className="delete-button" onClick={() => onDelete(entry.id)} aria-label="Delete time entry"><Trash2 size={16} /></button></div>; })}</div></section>
  </>; }

function Metric({ label, value, sub, trend, icon, alert }) { return <article className={`metric ${alert ? 'metric-alert' : ''}`}><div className="metric-top"><span>{label}</span><i>{icon}</i></div><b>{value}</b><div><small>{sub}</small><span>{trend}</span></div></article>; }
function CardHead({ eyebrow, title, action }) { return <div className="card-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button>{action}<ArrowUpRight size={14} /></button></div>; }
function GanttWeeks() { return <div className="gantt-weeks">{ganttWeeks.map((week) => <span key={week}>{week}</span>)}</div>; }
function ProjectGantt({ projects, allocations }) { return <section className="card gantt-card"><CardHead eyebrow="DELIVERY TIMELINE" title="Project Gantt" action="Sep - Dec 2026" /><div className="gantt"><GanttWeeks />{projects.map((project) => { const assigned = allocations.filter((allocation) => allocation.projectId === project.id).length; return <div className="gantt-row" key={project.id}><div className="gantt-label"><i style={{ background: project.color }}></i><span><b>{project.name}</b><small>{assigned} resources assigned</small></span></div><div className="gantt-track"><span className="gantt-bar" style={{ ...ganttStyle(project.start, project.end), background: project.color }}><b>{project.status}</b></span></div></div>; })}</div></section>; }
function ResourceGantt({ resources, projects, allocations }) { return <section className="card gantt-card resource-gantt"><CardHead eyebrow="PEOPLE SCHEDULE" title="Resource Gantt" action="Allocated hours / week" /><div className="gantt"><GanttWeeks />{resources.map((resource) => <div className="gantt-row" key={resource.id}><div className="gantt-label"><Avatar resource={resource} small /><span><b>{resource.name}</b><small>{resource.capacity}h weekly cap</small></span></div><div className="gantt-track resource-track">{allocations.filter((allocation) => allocation.resourceId === resource.id).map((allocation, index) => { const project = projects.find((item) => item.id === allocation.projectId); return project && <span className="gantt-bar resource-bar" key={allocation.id} style={{ ...ganttStyle(project.start, project.end), background: project.color, top: `${7 + index * 22}px` }}><b>{project.name} {allocation.hours}h</b></span>; })}</div></div>)}</div></section>; }
function Avatar({ resource, small = false }) { return <span className={`resource-avatar ${small ? 'small' : ''}`} style={{ background: resource?.color }}>{resource?.initials}</span>; }
function Status({ status }) { return <span className={`status ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>; }
function Modal({ title, onClose, children }) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><p className="eyebrow">WORKLANE</p><h2>{title}</h2></div><button onClick={onClose} aria-label="Close"><X size={19} /></button></div>{children}</div></div>; }
function Field({ label, name, type = 'text', defaultValue, min, required = true }) { return <label className="field"><span>{label}</span><input name={name} type={type} defaultValue={defaultValue} min={min} required={required} /></label>; }
function ProjectForm({ onSubmit, project }) { return <form className="form" onSubmit={onSubmit}><Field label="Project name" name="name" defaultValue={project?.name} /><Field label="Client" name="client" defaultValue={project?.client} /><Field label="Project owner" name="owner" defaultValue={project?.owner || 'Maya Chen'} /><div className="form-split"><Field label="Start date" name="start" type="date" defaultValue={project?.start || '2026-10-05'} /><Field label="End date" name="end" type="date" defaultValue={project?.end || '2026-12-18'} /></div><Field label="Budget (USD)" name="budget" type="number" min="0" defaultValue={project?.budget || '50000'} /><label className="field"><span>Delivery status</span><select name="status" defaultValue={project?.status || 'Planning'}><option>Planning</option><option>On track</option><option>At risk</option></select></label><button className="primary-button" type="submit">{project ? 'Save project changes' : 'Create project'}</button></form>; }
function ResourceForm({ onSubmit, resource }) { return <form className="form" onSubmit={onSubmit}><Field label="Full name" name="name" defaultValue={resource?.name} /><Field label="Delivery role" name="role" defaultValue={resource?.role} /><div className="form-split"><Field label="Weekly capacity" name="capacity" type="number" min="1" defaultValue={resource?.capacity || '40'} /><Field label="Hourly rate (USD)" name="rate" type="number" min="0" defaultValue={resource?.rate || '120'} /></div><button className="primary-button" type="submit">{resource ? 'Save resource changes' : 'Add resource'}</button></form>; }
function AllocationForm({ resources, projects, allocatedHours, onSubmit }) { return <form className="form" onSubmit={onSubmit}><label className="field"><span>Resource</span><select name="resourceId">{resources.map((resource) => <option value={resource.id} key={resource.id}>{resource.name} ({resource.capacity - allocatedHours(resource.id)}h free)</option>)}</select></label><label className="field"><span>Project</span><select name="projectId">{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label><Field label="Weekly planned hours" name="hours" type="number" min="1" defaultValue="8" /><button className="primary-button" type="submit">Add allocation</button></form>; }
function TimeForm({ resources, projects, onSubmit }) { return <form className="form" onSubmit={onSubmit}><div className="form-split"><label className="field"><span>Person</span><select name="resourceId">{resources.map((resource) => <option value={resource.id} key={resource.id}>{resource.name}</option>)}</select></label><label className="field"><span>Project</span><select name="projectId">{projects.map((project) => <option value={project.id} key={project.id}>{project.name}</option>)}</select></label></div><div className="form-split"><Field label="Date" name="date" type="date" defaultValue="2026-09-19" /><Field label="Hours" name="hours" type="number" min="0.25" defaultValue="4" /></div><Field label="Description" name="note" defaultValue="Delivery work" /><button className="primary-button" type="submit">Add time entry</button></form>; }

createRoot(document.getElementById('root')).render(<App />);

import { seedPets, clinics, services, seedAppointments } from "../data/seed";
const KEY = "petcare-midterm-demo-v1";
const wait = (ms = 370) => new Promise((resolve) => setTimeout(resolve, ms));
function initialize() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && Array.isArray(saved.pets) && Array.isArray(saved.appointments))
      return saved;
  } catch {}
  const data = { pets: seedPets, appointments: seedAppointments };
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}
function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}
const copy = (val) => JSON.parse(JSON.stringify(val));
export const demoApi = {
  async pets() {
    await wait();
    return copy(initialize().pets);
  },
  async pet(id) {
    await wait(220);
    const p = initialize().pets.find((p) => String(p.id) === String(id));
    if (!p) throw new Error("Pet not found");
    return copy(p);
  },
  async addPet(fields) {
    await wait(500);
    const data = initialize();
    const pet = {
      ...fields,
      id: crypto.randomUUID(),
      owner: "demo-user-1",
      clinic: fields.clinic || null,
      photo: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.pets = [pet, ...data.pets];
    save(data);
    return copy(pet);
  },
  async clinics() {
    await wait(260);
    return copy(clinics);
  },
  async services() {
    await wait(230);
    return copy(services);
  },
  async appointments() {
    await wait(260);
    return copy(initialize().appointments);
  },
  async addAppointment(fields) {
    await wait(460);
    const data = initialize();
    const appointment = {
      ...fields,
      id: crypto.randomUUID(),
      status: "booked",
    };
    data.appointments = [appointment, ...data.appointments];
    save(data);
    return copy(appointment);
  },
  async cancelAppointment(id) {
    await wait(290);
    const data = initialize();
    data.appointments = data.appointments.map((a) =>
      String(a.id) === String(id) ? { ...a, status: "cancelled" } : a,
    );
    save(data);
    return copy(data.appointments.find((a) => String(a.id) === String(id)));
  },
  async reset() {
    await wait(180);
    localStorage.removeItem(KEY);
    return true;
  },
};

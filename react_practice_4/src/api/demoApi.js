import { seedPets, clinics, services, seedAppointments } from "../data/seed.js";
import { API_CONFIG, DATA_KEY } from "./settings.js";
function wait(signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(
      () => {
        signal?.removeEventListener("abort", abort);
        if (Math.random() < API_CONFIG.errorChance)
          reject(new Error("Simulated server error. Please retry."));
        else resolve();
      },
      API_CONFIG.minDelay +
        Math.random() * (API_CONFIG.maxDelay - API_CONFIG.minDelay),
    );
    if (signal?.aborted) abort();
    else signal?.addEventListener("abort", abort, { once: true });
  });
}
function save(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}
function initialize() {
  const raw = localStorage.getItem(DATA_KEY);
  if (raw) {
    const data = JSON.parse(raw);
    if (!Array.isArray(data.pets) || !Array.isArray(data.appointments))
      throw new Error(
        "Stored data is invalid. Clear site storage to restore the demo.",
      );
    return data;
  }
  const data = {
    pets: seedPets.map((p) => ({ ...p, care_status: "Needs checkup" })),
    appointments: seedAppointments,
  };
  save(data);
  return data;
}
const copy = (v) => JSON.parse(JSON.stringify(v));
function find(data, id) {
  const pet = data.pets.find((p) => String(p.id) === String(id));
  if (!pet) throw new Error("Pet not found. It may have been removed.");
  return pet;
}
function validate(fields) {
  if ("name" in fields && !fields.name.trim())
    throw new Error("Name is required");
  if (
    fields.weight_kg != null &&
    (!Number.isFinite(Number(fields.weight_kg)) ||
      Number(fields.weight_kg) <= 0)
  )
    throw new Error("Weight must be positive");
}
export const demoApi = {
  async pets(signal) {
    await wait(signal);
    return initialize().pets.map(
      ({
        id,
        name,
        species,
        breed,
        color,
        date_of_birth,
        photo,
        created_at,
        care_status,
      }) => ({
        id,
        name,
        species,
        breed,
        color,
        date_of_birth,
        photo,
        created_at,
        care_status,
      }),
    );
  },
  async pet(id, signal) {
    await wait(signal);
    return copy(find(initialize(), id));
  },
  async addPet(fields, signal) {
    await wait(signal);
    validate(fields);
    const data = initialize();
    const pet = {
      ...fields,
      id: crypto.randomUUID(),
      owner: "demo-user-1",
      clinic: null,
      photo: null,
      care_status: "Needs checkup",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    data.pets.unshift(pet);
    save(data);
    return copy(pet);
  },
  async updatePet(id, fields, signal) {
    await wait(signal);
    validate(fields);
    const data = initialize();
    const pet = find(data, id);
    for (const key of [
      "name",
      "species",
      "breed",
      "gender",
      "size",
      "date_of_birth",
      "weight_kg",
      "color",
      "allergies",
      "notes",
      "care_status",
    ])
      if (key in fields) pet[key] = fields[key];
    pet.updated_at = new Date().toISOString();
    save(data);
    return copy(pet);
  },
  async removePet(id, signal) {
    await wait(signal);
    const data = initialize();
    find(data, id);
    data.pets = data.pets.filter((p) => String(p.id) !== String(id));
    data.appointments = data.appointments.filter(
      (a) => String(a.pet) !== String(id),
    );
    save(data);
    return { id };
  },
  async clinics(signal) {
    await wait(signal);
    return copy(clinics);
  },
  async services(signal) {
    await wait(signal);
    return copy(services);
  },
  async appointments(signal) {
    await wait(signal);
    return copy(initialize().appointments);
  },
  async addAppointment(fields) {
    await wait();
    const data = initialize();
    find(data, fields.pet);
    const item = { ...fields, id: crypto.randomUUID(), status: "booked" };
    data.appointments.unshift(item);
    save(data);
    return copy(item);
  },
  async cancelAppointment(id) {
    await wait();
    const data = initialize();
    const item = data.appointments.find((a) => String(a.id) === String(id));
    if (!item) throw new Error("Appointment not found");
    item.status = "cancelled";
    save(data);
    return copy(item);
  },
};

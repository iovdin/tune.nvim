import fs from "fs"; 

export default async function turn({ role, filename }) {
  if (filename) {
    fs.writeFileSync(filename, `@@${role}`);
  }
  return `now it is turn of ${role} to reply`
}

// import "dotenv/config"
// import fs from "fs"
// import path from "path"
// import  {connectDB}  from "../lib/mongodb.ts"
// import  Technology  from "../models/technology.ts"
export {};
// async function seedGlobal() {
//   try {
//     await connectDB()
//     const basePath = path.resolve("data") // adjust if needed
//     const patents = JSON.parse(
//       fs.readFileSync(path.join(basePath, "india/patents.json"), "utf-8")
//     )
//     const publications = JSON.parse(
//       fs.readFileSync(path.join(basePath, "india/publications.json"), "utf-8")
//     )
//     await Technology.findOneAndUpdate(
//       { name: "__india__" },
//       {
//         name: "__india__",
//         latest_json: {
//           india: {
//             publications,
//             patents          
//           },
//         },
//         updated_at: new Date(),
//       },
//       { upsert: true, new: true }
//     )
//     console.log("✅ Indian data seeded successfully")
//     process.exit(0)
//   } catch (err) {
//     console.error("❌ Error seeding indian data:", err)
//     process.exit(1)
//   }
// }
// seedGlobal()

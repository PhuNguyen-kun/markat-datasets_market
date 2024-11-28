const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const database = require("./index.js");
database.connectMongoDb();

const ImageSchema = new mongoose.Schema({
  ID_version: String,
  ID_part: String,
  base64Image: String,
  sender: String,
  sent_time : String,
  labeled: [
    {
      labeler: String,
      label: String,
      labeling_time : String
    }
  ]
}, { _id: false });

const DataSchema = new mongoose.Schema({
  ID_dataset: String,
  labels: [String],
  image: {
    type: ImageSchema,
    required: false,
  }
}, { collection: 'Data' });

const DatasetSchema = new mongoose.Schema({
  Name_dataset : String,
  Slug: String,
  Description: String,
  Price: Number,
  Voucher : Number,
}, { collection: 'Chatbot' });
// id_version = 1
// const labels = ["daisy", "dandelion", "roses", "sunflowers", "tulips"];
// const senders = ["1","19"];
// const labelers = ["2", "14", "26"];

// id_version = 2
// const labels = ["curly", "dreadlocks", "kinky", "straight", "wavy"];
// const senders = ["13"];
// const labelers = ["1", "17"];

// id_version = 11
const labels = ["daisy", "dandelion", "roses", "sunflowers", "tulips"];
const senders = ["1"];
const labelers = ["1"];

const getRandomSender = () => senders[Math.floor(Math.random() * senders.length)];
const getRandomLabeler = () => labelers[Math.floor(Math.random() * labelers.length)];
const getRandomLabel = () => labels[Math.floor(Math.random() * labels.length)];
const getRandomValue = (number) => (Math.floor(Math.random() * number) + 1).toString();
const getRandomValueBetween = (min, max) => {
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};

// select id_user from user_version_participation where id_version = 1 and participation_type = 'Labeling';
// select id_user from user_version_participation where id_version = 1 and participation_type = 'Sending';

const Data = mongoose.model('Data', DataSchema);
const getRandomLabeledForUsers = (number) => {
  const labelCount = Math.floor(Math.random() * number) + 1;
  const uniqueLabelers = new Set();

  while (uniqueLabelers.size < labelCount) {
    if (uniqueLabelers.size === labelers.length) break;
    uniqueLabelers.add(getRandomLabeler());
  }

  return Array.from(uniqueLabelers).map(labeler => ({
    labeler: labeler,
    label: getRandomLabel(),
    // id_version = 1
    // labeling_time: getRandomTimeBetween('2024-06-15 10:30:00', '2024-07-11 21:37:19'),
    // id_version =2
    // labeling_time: getRandomTimeBetween('2024-12-20 12:00:00', '2024-12-26 16:39:59'),
    // id_version = 11
    labeling_time: getRandomTimeBetween('2025-12-05 10:00:00', '2025-12-07 17:18:42'),
  }));
};

const getRandomTimeBetween = (start, end) => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  const randomTime = new Date(startDate + Math.random() * (endDate - startDate));
  return randomTime.toISOString().replace('T', ' ').substring(0, 19);
};

const getRandomTimes = (start, end) => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  // Tạo 2 giá trị ngẫu nhiên giữa 0 và 1, sau đó sắp xếp để đảm bảo thứ tự
  const randomFactors = [Math.random(), Math.random()].sort((a, b) => a - b);

  // Tính toán các mốc thời gian
  const time1 = new Date(startDate + randomFactors[0] * (endDate - startDate));
  const time2 = new Date(startDate + randomFactors[1] * (endDate - startDate));
  const time3 = new Date(startDate + Math.random() * (endDate - startDate));

  // Sắp xếp để đảm bảo time1 < time2 < time3
  const times = [time1, time2, time3].sort((a, b) => a - b);

  // Trả về mảng 3 thời gian dưới định dạng yyyy-MM-dd HH:mm:ss
  return times.map((time) =>
    time.toISOString().replace('T', ' ').substring(0, 19)
  );
};

const uploadImagesToMongo = async () => {
  try {
    for (let index = 1; index <= 1; index++) {
      const imageDirectory = path.join(__dirname, '..', 'package/Datasets/Collections', index.toString());
      const files = fs.readdirSync(imageDirectory);
      for (const [fileIndex, fileName] of files.entries()) {
        const filePath = path.join(imageDirectory, fileName);
        const fileBuffer = fs.readFileSync(filePath);
        const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
        const sizeInBytes = (base64Image.length * (3 / 4)) - ((base64Image.endsWith('==') ? 2 : base64Image.endsWith('=') ? 1 : 0));
        // Convert bytes to megabytes (KB)
        const sizeInMB = sizeInBytes / (1024);
        console.log(sizeInMB);

        // const newDataset = new Dataset({
        //   ID_dataset: '1',
        //   labels: labels,
        //   image: {
        //     ID_version: '11',
        //     ID_part: getRandomValueBetween(21,30),
        //     base64Image: base64Image,
        //     sender: getRandomSender(),
        //     // id_version = 1
        //     // sent_time: getRandomTimeBetween('2024-01-03 12:00:00', '2024-01-05 01:04:11'),
        //     // id_version = 2
        //     // sent_time : getRandomTimeBetween('2024-03-01 09:30:00','2024-05-12 12:20:30'),
        //     // id_version = 11
        //     sent_time : getRandomTimeBetween('2025-12-03 10:00:00','2025-12-04 07:27:30'),
        //     labeled: getRandomLabeledForUsers(5)
        //   }
        // });

        //await newDataset.save();
        console.log(`Document for ${fileName} saved successfully!`);
      }
    }
  } catch (error) {
    console.error("Error uploading images:", error);
  } finally {
    mongoose.connection.close();
  }
};

const printAllDatasets = async () => {
  try {
    const datasets = await Data.find();
    console.log("All datasets in MongoDB:");
    console.log(datasets);
  } catch (error) {
    console.error("Error retrieving datasets:", error);
  } finally {
    mongoose.connection.close();
  }
};

const countDatasets = async () => {
  try {
    const count = await Data.countDocuments();
    console.log("Total number of datasets:", count);
  } catch (error) {
    console.error("Error counting datasets:", error);
  } finally {
    mongoose.connection.close();
  }
};

const addLabelToImage = async (datasetId, newLabel) => {
  await Data.updateOne(
    { ID_dataset: datasetId },
    { $push: { "image.labeled": newLabel } }
  );
};

const random = async () => {
  //for (let i = 0; i < 15; i++) {
    const time = getRandomTimeBetween('2024-01-05 01:04:11', '2024-07-11 21:37:19');
    console.log(time);
  //}
};

// Hàm query đếm số bản ghi có ID_part = 1
const countRecordsWithIDPart = async () => {
  try {
    // Thực hiện query đếm số bản ghi
   for (let index = 1; index <= 30; index++) {
    const Number_of_record = await Data.countDocuments({ 'image.ID_part': `${index}` });
    const ID_version = await Data.findOne({ "image.ID_part": `${index}` }, { "image.ID_version": 1, _id: 0 });
    console.log('(', ID_version.image.ID_version, ',' , index, ',', Number_of_record, '),');
  }

    // Đóng kết nối sau khi hoàn thành
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error querying the database:', error);
  }
};
const roundDownToTwoDecimals = (value) => {
  console.log(value);
  console.log(Math.floor(value * 100) / 100);
  return Math.floor(value * 100) / 100;
};
// Gọi hàm uploadImagesToMongo
// uploadImagesToMongo();
// Gọi hàm để đếm tổng số datasets
// countDatasets();
// Gọi hàm in tất cả datasets
// printAllDatasets();
// Thêm một nhãn mới
// addLabelToImage("data_1", { labeler: "user_03", label: "2" });
// sinh ngẫu nhiên ngày
// random();
// countRecordsWithIDPart();
// roundDownToTwoDecimals(15/36);

// const DatasetSchema = new mongoose.Schema({
//   Name_dataset : String,
//   Slug: String,
//   Description: String,
//   Max_price: Number,
//   Min_price : Number,
//   Voucher : Number,
// }, { collection: 'Chatbot' });
// const Dataset = mongoose.model('Dataset', DatasetSchema);

// const setUpDataset = async () => {
//   try {
//     client.connectPostgresDb();
//     client.connectMongoDb();
//     const { rows: datasets } = await client.query(
//       `SELECT
//         d.ID_dataset,
//         d.Avatar,
//         d.Name_dataset,
//         d.Verified,
//         d.Slug,
//         (SELECT COUNT(*) FROM Dataset_view uc WHERE uc.ID_dataset = d.ID_dataset) AS Views,
//         d.Voucher,
//         df.Data_format AS Data_Format,
//         CAST((SELECT COUNT(*) FROM Version v WHERE v.ID_Dataset = d.ID_Dataset) AS INTEGER) AS Version_Count,
//         COALESCE(
//           (
//             SELECT MAX(v.Valuation_due_date)
//             FROM Version v
//             WHERE v.ID_dataset = d.ID_dataset AND v.Valuation_due_date <= NOW()
//           ), '2024-01-01 10:00:00'
//         ) AS latest_valuation_due_date
//       FROM
//         Dataset d
//       LEFT JOIN
//         Data_format df ON d.ID_data_format = df.ID_data_format
//       LEFT JOIN
//         Dataset_topic dt ON d.ID_dataset = dt.ID_dataset
//       GROUP BY
//         d.ID_Dataset, d.Avatar, d.Name_dataset, d.Verified, d.Voucher, df.Data_format
//       ORDER BY
//         d.ID_Dataset ASC
//       `,
//     );
//    let preparedDatasets = [];
//     for (let index = 0; index < datasets.length; index++) {
//       const data = datasets[index];
//       let { rows : datasetDes } = await client.query(
//         ` SELECT
//           d.ID_dataset,
//           d.Name_dataset,
//           d.Avatar,
//           COALESCE(dsr.Description, dbr.Description) AS Description,
//           ARRAY_AGG(DISTINCT t.Tag_name) AS Tags,
//           ARRAY_AGG(DISTINCT v.ID_version) AS Versions,
//           MAX(v.price) AS max_price,
//           MIN(v.price) AS min_price
//           FROM
//             Dataset d
//           LEFT JOIN
//             Data_selling_request dsr ON d.ID_dataset = dsr.ID_dataset AND d.Request_type = 'Selling'
//           LEFT JOIN
//             Data_buying_request dbr ON d.ID_dataset = dbr.ID_dataset AND d.Request_type = 'Buying'
//           LEFT JOIN
//             Dataset_tag dt ON d.ID_dataset = dt.ID_dataset
//           LEFT JOIN
//             Tag t ON dt.ID_tag = t.ID_tag
//           LEFT JOIN
//             Version v ON d.ID_dataset = v.ID_dataset
//           WHERE
//             d.Slug = $1
//           GROUP BY
//             d.ID_dataset, d.Name_dataset, d.Avatar, dsr.Description, dbr.Description;`,
//         [data.slug]
//       );
//       console.log(datasetDes[0]);
//       // console.log(datasetDes.max_price);
//       // console.log(datasetDes.min_price);

//       const dataset = new Dataset({
//         Name_dataset: data.name_dataset,
//         Slug: `http://localhost:5173/datasets/${data.slug}`,
//         Description: datasetDes[0].description,
//         Max_price: Number(datasetDes[0].max_price),
//         Min_price : Number(datasetDes[0].min_price),
//         Voucher: data.voucher || 0,
//       });
//       preparedDatasets.push(dataset);
//       // console.log(data);

//     }

//     console.log("Prepared datasets:", preparedDatasets);
//     return preparedDatasets;
//   } catch (error) {
//     console.error("Error in setUpDataset:", error);
//     return [];
//   }
// };

// const pushData = async () => {
//   try {
//     const datasets = await setUpDataset(); // Lấy dữ liệu đã chuẩn bị
//     // console.log("Datasets fetched for MongoDB:", datasets);

//     if (datasets.length > 0) {
//       await Dataset.insertMany(datasets);
//       console.log("Datasets inserted successfully!");
//     } else {
//       console.log("No datasets to insert.");
//     }
//   } catch (error) {
//     console.error("Error in pushData:", error);
//   } finally {
//     mongoose.connection.close(); // Đóng kết nối MongoDB
//   }
// };

// // Gọi hàm để chạy
// pushData();

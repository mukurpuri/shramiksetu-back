
import express from 'express';
import config from '../config/index';
import Area from '../models/areas';
let router = express.Router();
import mongoose from "mongoose";

  
router.post(
  "/insert-area",
  async (req, res) => {
    let areaData = ["Agra Road",
    "Ajmer Road",
    "Ambabari",
    "Amer",
    "Bani Park",
    "Chandpole",
    "Civil Lines",
    "Gangapole",
    "Jhotwara",
    "Kalwar",
    "Kanota",
    "Khatipura",
    "Mansagar Lake",
    "MI Road",
    "Moti Doongri",
    "Rambagh",
    "Ramgarh Lake",
    "Sansar Chandra Road",
    "Sirsi",
    "SP Road",
    "Tonk Road",
    "Vaishali Nagar",
    "Vaishali Nagar",
    "Mahaveer Nagar",
    "Jagatpura",
    "Sirsi Road",
    "Ajmer Road",
    "Bapu Nagar",
    "Tilak Nagar",
    "Malviya Nagar",
    "Agra Road",
    "Transport Nagar",
    "Kukas",
    "Renwal Phagi Road",
    "Nari Ka Bas",
    "Kalwar Road",
    "Chitrakoot",
    "Subhash Marg",
    "Lajpat Marg",
    "Govindpura",
    "Anand Lok",
    "Sikar Road",
    "Shyam Nagar",
    "Vidhyadhar Nagar",
    "Raja Park",
    "Tonk Road",
    "Bani Park",
    "Parthviraj Nagar",
    "SC Road",
    "Ashok Nagar",
    "Jalupura",
    "Goner Road",
    "Adarsh Nagar",
    "Gopalpura By Pass",
    "Pahadiya Road",
    "Sahdev Marg",
    "Padampura",
    "Sethi Colony",
    "Gopalbari",
    "Vatika",
    "Lal Kothi",
    "Tagore Nagar",
    "Jhotwara Road",
    "Milap Nagar",
    "Takht E Shahi Road",
    "Vivekanand Marg",
    "New Sanganer Road",
    "Shastri Nagar",
    "Bhawani Singh Road",
    "Civil Lines",
    "Malpura",
    "Pratap Nagar",
    "Shanti Nagar",
    "Diggi Road",
    "Nirman Nagar",
    "Shahpura",
    "Sachivalaya Nagar",
    "Ramnagar",
    "RIICO Industrial Area",
    "NH-8",
    "Sanganer",
    "Jhotwara",
    "Baroni",
    "Jyoti Nagar",
    "Triveni Nagar",
    "Sitapura",
    "Raj Bhavan Road",
    "Sagram Colony",
    "Jaisinghpura",
    "Gokulpura",
    "Sardar Patel Marg",
    "Durgapura",
    "Udyog Nagar",
    "Gopalpura",
    "M I Road",
    "Moti Dongri Road",
    "Khatipura",
    "Boraj",
    "Shivdaspura",
    "Heerawala",
    "Jawahar Nagar",
    "Hanuman Nagar",
    "Bhan Nagar",
    "Officers Campus Colony",
    "C-Scheme",
    "Marudhar Nagar",
    "Sodala",
    "Bagru",
    "Virat Nagar",
    "Bichun",
    "Niwai",
    "Achrol",
    "Phulera",
    "Amer",
    "Saiwad",
    "Mansarovar",
    "Asalpur",
    "Mahapura",
    "Chaksu",
    "NH-12",
    "Mahal Road",
    "Sindhi Camp",
    "Sahakar Marg",
    "Patrakar Colony",
    "Shiprapath",
    "Muralipura",
    "Bhojpura",
    "Chirnotiya",
    "Kanota",
    "Ambabari",
    "Simliya Road",
    "Roop Vihar Colony",
    "Tonk Phatak",
    "Benad Road",
    "Gandhi Path",
    "Palsana Road",
    "Tilawala",
    "Anita Colony",
    "Kalwara",
    "Purani Basti",
    "Paldi Meena",
    "Girdharipura",
    "Hathroi",
    "Shankar Nagar",
    "Narayan Vihar",
    "Ghati Karolan",
    "Dudu",
    "Brijlalpura",
    "Sanjay Nagar",
    "Dantri",
    "Jamwa Ramgarh",
    "Moti Nagar",
    "Kanwar Nagar",
    "Jaswant Nagar",
    "Vishwakarma Industrial Area",
    "Muhana",
    "Renwal Manji",
    "Arjun Nagar",
    "Nehru Nagar",
    "Jobner",
    "Sawarda",
    "Bassi",
    "Brahmpuri",
    "Jamdoli",
    "Budhsinghpura",
    "Bajaj Nagar",
    "Anand Nagar",
    "Hasanpura",
    "Govindpuri",
    "Dholai",
    "Subhash Nagar",
    "Mandha",
    "Bais Godam",
    "JLN Marg",
    "Bhankrota",
    "Ajairajpura",
    "Jharna",
    "Sidharth Nagar",
    "Karolan Ka Barh",
    "Surya Nagar",
    "Kotputli",
    "Kanakpura",
    "Govind Nagar",
    "Shiv Nagar",
    "Maruti Nagar",
    "Doongri",
    "Amrapali Circle",
    "Jairampura",
    "Ramsinghpura",
    "Shikarpura",
    "Sarna Doongar",
    "Niwaru",
    "Boytawala",
    "Keshar Vihar",
    "Chokhi Dhani",
    "Sector-26",
    "Manoharpura",
    "Bagrana",
    "Mangarh Khokhawala",
    "Naradpura",
    "Lalarpura",
    "Bindayaka",
    "Laxmi Narayan Puri",
    "Nandlalpura",
    "Mahalan Ajmer Road",
    "Madhorajpura - Chandma Road",
    "Chittora",
    "Alwar Highway",
    "Bhambori",
    "Sunder Nagar",
    "Ganatpura",
    "Phagi Road",
    "Sumer Nagar",
    "Chandpole",
    "Naraina",
    "Manyawas",
    "Keshwana Rajput",
    "Johri Bazar",
    "Bapu Bazar",
    "Sanjay Bazar",
    "Ghat gate",
    "Ramganj",
    "New Gate",
    "Chaura Rasta"];
    try {
        areaData.forEach(async (ar) => {
            let newArea = await new Area({
                city: new mongoose.Types.ObjectId('5f15586ad0b2dd88bd618754'),
                name: ar,
                isActive: true
            });
            await newArea.save();
        });
        return res.json({
            result: "ok"
        });
    } catch (err) {
        return res.status(500).send(err);
    }
  }
)

export default router;

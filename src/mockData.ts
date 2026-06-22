import { Property } from './types';

// Constants for hot-linked image assets
export const IMAGES = {
  heroBg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjBtjEMPWEWAazpixA1yVeBrihaMJMcUBHwsKzvyqT0aWvEIaxfdYobHfFSHEYztvIsNDrDr1BAop_Lu1N2UFsU9RpblCIjn6_HHdpch1st0pKtRkwPdAk85RjRlX0OInwk8E-6g_FftjSAbzMTXuMFXswIlb-67V7RLhi7jStjILS1Z-YWXwVEHLqaFtRiNiJSpdqJFK41qbcgyneCeIW2J-PkOMvwPL-5sW2vL5EaPo9NDgK6eWDgPGmlg4_BpncofaettrijDg",
  
  // Avatars
  avatar1: "https://lh3.googleusercontent.com/aida-public/AB6AXuAR9v4VG5yXTs0kQ0eydyq6jfr5co7V8LG0fzlVOt5ujb67bBM04FpmIM_KvkkQph27T5zNcUz2qDrfSfk4OxIINXRkpqCrdWecuA1n1D4jfx6nctvqlst412ry6Rtk2C8SJ6Fa6bOustD7eMkDPqld3w5xf9c2qrM5wfTX9DwFS4TLnG0sJ-jDOsWZp7TX3-sDDgOMI2GwF2lvQ698MTmWTOPuDWB5nH6ilvH5y1v7KMY1BqvasAlmbI8OirCQFHnwOKtVebFsqzo",
  avatar2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDTUbUaFZG-RPhqmseFT6MmHnO3mXi8sK5RtdRgC1Fxp7n8y6ZOgjj-eMU6ALDSPndPyH6abJl45I1uppKr_HrfVj-mzsAxeusXmsU5Hg38pWP3x3tXEIrr2SoA_OYA-BtcpFcZpQHw2_SItoeEo8sPeYZv3P6l3LsLTmJXFVnVqQa9scbA2WyWhgdgr7qmPesWjBYlGtnwWPdlRh-xRJVI_JCRhMC-7irq5zk8X7XlOoyQcb6sC7Gm3xfAa4b5FYhu8zJPRveiVY",
  avatar3: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT_rudNAE4exWBTGGM32uHxv16F--DJLaXSXjqAGGBOBxlRiUTCA82MXPbeqEFx90OLbvKDB46_YJSYbu5C8P9i3evjemI594tMXHIh8Kuocc1dA-bdQueUeroCy5Fjyp_cDf5ODYvlgkKrFuJ_gn9-J0kCXEzlpWJLXRoFYlmjfnvhowW6If0PbqgZLNb5US1nq24XC6mN82y_gSTtbvtS1EqojtfPEF7Fw_e1GTNgjtG2DTx6rvHEjTdjfJlgG8ZpsA_-ubPtQk",
  avatar4: "https://lh3.googleusercontent.com/aida-public/AB6AXuBasg5IoRugxEggHlY5Vmrp2N6gHP-sIJo7_9leZXhpTxWM7dWScNnJV7BjFx5HlJ5Nkxu02EM0zM7hR6SmPfvIARXTjHJdLu2RAqFzb8IbA0XZD48tVVAZgErlUhHYZKG0u_0YXBK3KoInVKKAXJe9QNurlRZIlroMMaROp0DkLOYaailPaR5-H4mK3EEzKkiy9eijTkXHsaLRRPsjT6ClS-jibJhtY3GdRgYxaPRiMIxTM9Upyo2eYdTrAVzSiOy6UknnmcSr76M",
  avatarDefault: "https://lh3.googleusercontent.com/aida-public/AB6AXuBulLdlrDptS-aS9p4qz-3zQ-R9LUASKtkVx24_ih10ZwE-VepQxULI2UwDLikKQ1yQneFDcFb-ENq1mpfdnzps1Ut9WZ35QcQSW5YB0VXZLCmBnCjpJK-Lp6j3DPsHVUfjCEP6-oyBPKQexcXBuauAuhoqy2lVqvRhv761rpv_8_vGmTxWQ23Z3JCCfPSqvGWvFvhYG2fsI_EnYUg2W_nZ4Sl3sm8RqYWky5SaGyHumMPJg9aYrHAmZlWg5gagCIvwzrTdV1QBqwA",

  // Rooms & Apartments
  roomAttic: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIDJRNQ7BnNwp4g4znlItio2MP0cVYJXbHX5Hb0h-AmnMSDH6M4C7cgXJJMYsn4ayXKnl6KuJBVs47z1uiSkolyiRsuQJLV3VBSETbR_QNIZIPEUV70XhK9LeOuUmKTE7IZu7Ln32jxrCK6kIDSwfJADETCzSb2ibvCTGQqG3r9SJKyLTWkoq4yMqHIwQ5DGVakS961GSDba6bKc1WcmgORUHkmpX5pyoCN3V_H4obVzrMZdedGQ8Pm38qgnCUBVKvblkDb9KS2vA",
  roomDoubleTraditional: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_qLqd15vf8sNylFHGeQM4hcIMtcWh5JzWzXqtJw9huvWT5XRr3G427MIU2Qm8ylRMBli7Fb5LCgSCoWPbdkCeSa911jbE2P1PTmxcdn9JYkjz0_1iWnzYWbVBy2iQlswOhzKywOI0dEgvakFX7n08YD0f6iOuzUHDVfccB605ssB074thKtqizZVbkYFJLh0bpkdo9yPG6FC0tawG-avPYmAR0K8TkMtLnFL2W1eZ3-3HEDsjEsL3wGICg3P-C3tlXcQhExbMVZc",
  roomKitchenette: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ-nlyeQjipsLX8wKii2cy6TQC3REt-L16E9FgdKCE8pA2Chi-odcoFJsjDxqxrNTpCDl_Kd6Bl_Ui-ZSkAM9Ydv2ZCn5XZztgqmU4Au1JiEhsbK7x6S3_dyBC1Dy20uPyYB9inIWfXBvjyw_chb6yHvJL0ysWMQ3xKt5C77MxGcVzoZbP4pHEh6bNAY0eib6WjbQbmp0WdAV1kC1xlQBBSewMH7IfasOG6wDAHCqXQBdS0lW65wRSVkmxIz0ag0rkOMHhrqjs3GA",
  aptPatanInterior: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNb_njq-fML7kYKIA2GCRmCo-VgykQUD0mLNrVoc82LwPgNar7ba0wJXT_phf09NYDHL58VhectpJRB4pchWsajJqHkowioVeRZ7Yc3y-pr-WBQO12QEpG_8OX62fF5W2QxlSeQ_CK-aZaOgLmuIrzbyDMuzXwVszgLAcZKf9Hfqv1UrlIIW6h4e3kbFo7y5Ssy4qenyftl2cIPjN5E8VX6wIp2Yie-2HmX0siCUu_vJaGObJ1QJ5KwlHUDEDTWQgf3ap4ie7O90o",
  roomCozyNepalese: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9tyzpOTdqI7oo7YPbLmzXJ6Y7UHQuNrDUA2o66EJ_zmrjW3CX1ssiD89MSl2WOTZWPZTzpNTu_MlWJqrdhsDC8br6IBsnWSV6qll56RNn-fO8OHszCrnYHQV8NkfkxApZhXeUnw6VBAWw6fWuE3gB4IaSPY9sJkH-uo_n-CgDCfnU4hy645zwZzNOKru1mbbQqNGB4njE8_Hv2c2lWQzyzVuJ6rogj5ZEbF2rV5MHGPlksNRgN0wvvbbBtw9YrEH-kN2b9Ngs7sE",
  kitchenCleanApt: "https://lh3.googleusercontent.com/aida-public/AB6AXuCea5TNLyAQ8UPHtTl_xqA1ChzMmkShyb0Qp-I0xl1XwhCCjNouhVYf5X6lJqvckXyHNuaelVIw9zG40dvNM-m5AVugQ5WTOSO1LnCrTsQgc0OGjWQnWaGAEoi0p5qGQSneRdNFb0K4a8DD5YPMRCiTOITot6o58Jts-_kQpJ-q7luRPLj-ksdv0822I2oF4jVZJ5S-IAGSjQGBsuAg4Ejz9wrZs8VviXTK28oMOib2d5D8hFShv1Xappz1j6a5Q33RyBcyR7jQjc0",
  bathroomModern: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRm7lBc4R16bt_U7NVM_3-p7PZuD7fgpV3hcr8GbMDyxByOLptLCOm41cyP8YPHXWs-hME3W0kA2UBSqgzs4-_nD7vUoukCMcVx9zHZFUuz4sfLv_cbRmFA8pSQAcuVVtCpFMmqAdrl3Pq1abh-2WVaiIrar8VA3c1fhkkVlaX5utRjRUtEE1LKMuQcRLn8LjXfVhLxgM9q-xehXaM96-67ceumJPvok-e2hfEcmxlV964Y8DNGs9I1pFH0K1sSg46HHX4cCgA4y4",
  balconyApt: "https://lh3.googleusercontent.com/aida-public/AB6AXuB91haplJWZbDM_E9LmECKZ2fHUFxBDddvsIwbc6dbw0VG48gtKrgI9WLVPQYxMzwGx5B02xX0VoUO8PUzaxye6QhTnCVzOH0flcOAaMHTreDCdQZq6BjPImbHh4vUmGZRuDW5EcZBsz94Snpk4ZN30_WZb2lncevMQfjEam_qSIo7Q0tb2G-SzmyhvV_wFNoQ3cgpYcXBQ9mTMPZHpN9RmMuu-XQCiNJ79DolVkm7AgFCUyFZgeTFfueksIbLM_qabNgqT7_b5n7U",
  mapPatanRepresent: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX2FnmtpIhz5RCUpg_yQu_-k09Ab2V2O3509DhQlkN1ySJTlEc2bDk9XFGUiBUNkE_5Tblsyqip_HsQqgRHmqDcs6ka1YDjyubfZqosXc6FT3ZXlDG3Xz5uOHpgCsV7rXzj6MXuoHSgEVqsEKgSYbd918H3UeiloCGqtX6Xrrb1GgVYmsUK8V7kH437w_h-f_OitaxXWUM84xmvvhImh61jLJSbHJooJupVEzOdp2cWqkpNblSP4UYiWukQtVfFgCjbf0gijM7Km0",
  flatSunnyKtm: "https://lh3.googleusercontent.com/aida-public/AB6AXuDb2E0258c0oEJjCAP2yae40Y7pmoZZyHG2n7fGTk3Byf0R67RrNrZqD60lOV4GB-MMSl3iPbUlfrCNaDeJ7ic0uuGHWz1OkzlXXLlmGMkvb4ZZh8sqFhcSmB1PauYZ62A79RqgF3pHPhFJgEiPHbGSKZJFO3aeJObO37uXAFpNWbnfQ-Or4RL03v7_hvklf9MZ1qa9K2iryZ19DTFsTPJawiHs3RemJBQ2Julrvqty-lCePjBwP3q6LsRE7IRpdxje5KddPMIV1_4",
  livingPatanTactile: "https://lh3.googleusercontent.com/aida-public/AB6AXuBB4Xe-BOhjdtbSqY8aPkC5DWAiXlD6YOL36P6gnVxWKmLSMtmNxq5T7lAMcSPaPXLDrGiEJi-WRA4QUE4F5y5le-G38KKEaj91QMVhhBkv8QOBBie4pgYuXOT_IUVW9qXMquwfFPIBbbGYYbMLhO5PeTMui70EkNmQs1wldBCplRv0WaLQv2ix8sTRVOaednXZE7V18U98zNgrTW8zVOVSBwVx-CgNbq2vDoXykqXpNC--PWBiEugf63rouhEA39qSON3g9X1a16I",
  familyAptLazimpat: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgsJ1LWsPqa6v6kqRWams22OrxSADohSJ5oz8SnyukAz2j1KjqjF0t3kYaSkE0ff5xMmhoe6dtBgDEJGVgJ4reIP01N-OwdqAyjIWkMOAV3wWbIHV_XD4nnWK63wnl8Jy4ikZbIMpbYujTr35c_w1ZPn5PoW54aWSpRaDNO1R6H-M162GuqAC2ZDfQqHER3lJN1ucUf0J0ftfEJdsOXp6MXQDG91mC8FIq6o6Z7_mYwAj9iKiLavSSqA5O1gA4Mb77QFoiFzgv4_Y",

  // Hostels
  hostelBoysBaneshwor: "https://lh3.googleusercontent.com/aida-public/AB6AXuBN0jr0PelGJ9ZcJezKXzg7OoDRwHfP-36gS6ySwG5UJqmrSz9RUD8Df4KDZpoRF4NCnxFwPuXtae0yY6KYXKQJchGlFBtlJRYadXAulaJVIo_rRbqiFpmPb59ogMtMGwyMwzBRNqehYJ8nw_7p5kZXK6r5kpfQ52rvt-C9xbal_EKHh5BdKeWKy06B-SF6uO0pPWMjGwHbiDGHNWsQE6QGBJJb6gAOHh18XF87suZHMIDCj_qmWA8vVaR5UzCvF6A1PmFMLJCWaIM",
  hostelBoysAnnapurna: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqGIuhm9MKQ9fdkeunTtho5Uw7SeWRLFYuMexT5xHgSfmxwJRHIRO24FjrU8icIO--jv7gd5ctMqhYHYkLL0W1vDoXSYG9jzo1zK0MwgJBh3GDO7pjoZ6SgNstbRceC7BrdpQtYsJ7KeaRqKqbTCFK6_OUS1tRIvHS99Z0Q751fD1PMECMXLTZeIdF4KpMVcLjn9HY_6d3VlvTQHJkD5vBgFANGxZ7agAhOa9_7DjL9e_mtJT1J6Vf9VBCltKvSYpyA3mX-1Lzk1A",
  hostelGirlsKitchen: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6KDL9bcpq5WfQir9iIGxKhPxG9muHiW9vSvjE670Rzj4P07eyKcTXzh8ep1NKLG2r0Y0lHUC0CTO5t5sdU4ze2SKrDAr6FN67MQjKZx_SlgTdxj_RFc4Y4xUxOHMEQAJWpp7MbhtutU1IF-Jof_o7A8uK5sFtCcoIYMXaKVnlCAxsBouo7_aj9SbdTkrRrHEW9_jWvQChdAJ2fMjoUrFmFoPq7SXQbVNLp1_TxMlRzYPc0Mzaovh8YQBKk6ksH66Xf3TibhcuXEE"
};

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    title: "Sunny Studio in Patan",
    description: "Bright apartment in residential Patan. Perfect for students and couples looking for a sunny space with great accessibility to local cafes, universities, and public markets.",
    price: 25000,
    type: "studio",
    city: "Patan",
    area: "Patan Dhoka",
    district: "Lalitpur",
    rating: 4.8,
    verified: true,
    featured: true,
    image: IMAGES.livingPatanTactile,
    imagesList: [IMAGES.livingPatanTactile, IMAGES.roomCozyNepalese, IMAGES.kitchenCleanApt, IMAGES.bathroomModern, IMAGES.balconyApt],
    amenities: ["WiFi", "Attached Bath", "Kitchen", "Water 24/7", "Power Backup"],
    host: {
      name: "Ramesh Shrestha",
      phone: "+977 9851012345",
      email: "ramesh.patan@gmail.com",
      avatar: IMAGES.avatar3
    },
    reviews: [
      { id: "rev-1-1", reviewerName: "Bishal Gurung", rating: 5, text: "Excellent studio with beautiful morning sunshine. The host is extremely welcoming and helpful.", date: "2026-06-01" },
      { id: "rev-1-2", reviewerName: "Pooja Acharya", rating: 4.6, text: "Very friendly environment. The solar heater works great even in winter seasons.", date: "2026-06-12" }
    ],
    dateAdded: "2026-05-20",
    creditsNeeded: 1
  },
  {
    id: "prop-2",
    title: "Bright Attic Room in Kirtipur",
    description: "Bright sunlit attic room with high-key natural lighting and traditional brick facades. Ideally situated close to Tribhuvan University (TU), with a cosy compact wooden layout perfect for focused studying.",
    price: 8500,
    type: "room",
    city: "Kirtipur",
    area: "Naya Bazaar",
    district: "Kathmandu",
    rating: 4.8,
    verified: true,
    featured: false,
    image: IMAGES.roomAttic,
    imagesList: [IMAGES.roomAttic, IMAGES.roomCozyNepalese, IMAGES.kitchenCleanApt, IMAGES.bathroomModern],
    amenities: ["WiFi", "Water 24/7", "Kitchen", "Balcony"],
    host: {
      name: "Gopal Maharjan",
      phone: "+977 9841987654",
      email: "gopal.kirtipur@outlook.com",
      avatar: IMAGES.avatar4
    },
    reviews: [
      { id: "rev-2-1", reviewerName: "Sushil Pandey", rating: 5, text: "Best budget room for TU students. Neat skylight lets in amazing natural daylight.", date: "2026-06-15" }
    ],
    dateAdded: "2026-06-02",
    creditsNeeded: 1
  },
  {
    id: "prop-3",
    title: "Spacious 2BHK Apartment near Patan Durbar Square",
    description: "Elegant, spacious 2BHK apartment situated just a couple of minutes walk from the iconic Patan Durbar Square. Features custom wooden craftsmanship, reliable solar hot water systems, high-speed fiber internet, and full power backups.",
    price: 32000,
    type: "flat",
    city: "Patan",
    area: "Patan Durbar Area",
    district: "Lalitpur",
    rating: 4.9,
    verified: true,
    featured: true,
    image: IMAGES.aptPatanInterior,
    imagesList: [IMAGES.aptPatanInterior, IMAGES.roomCozyNepalese, IMAGES.kitchenCleanApt, IMAGES.bathroomModern, IMAGES.balconyApt],
    amenities: ["WiFi", "Solar Water", "Power Backup", "Balcony", "Kitchen", "Parking"],
    host: {
      name: "Deepa Shakya",
      phone: "+977 9813245678",
      email: "deepashakya88@gmail.com",
      avatar: IMAGES.avatar1
    },
    reviews: [
      { id: "rev-3-1", reviewerName: "Jack Henderson", rating: 5, text: "Stunning craftsmanship and unbelievable hospitality. The solar hot water is a savior. Fully premium experience.", date: "2026-05-18" },
      { id: "rev-3-2", reviewerName: "Niraj Bajracharya", rating: 4.8, text: "Very modern interior while preserving local Newari charm. Walking distance to excellent local diners.", date: "2026-06-10" }
    ],
    dateAdded: "2026-06-05",
    creditsNeeded: 1
  },
  {
    id: "prop-4",
    title: "Peaceful Room with Balcony",
    description: "A comfortable, peaceful room with an attached private balcony. Strategically located in New Baneshwor, giving you access to all central transit highways while enjoying quiet surroundings.",
    price: 15000,
    type: "room",
    city: "Baneshwor",
    area: "Aloknagar",
    district: "Kathmandu",
    rating: 4.6,
    verified: false,
    featured: false,
    image: IMAGES.roomCozyNepalese,
    imagesList: [IMAGES.roomCozyNepalese, IMAGES.kitchenCleanApt, IMAGES.bathroomModern, IMAGES.balconyApt],
    amenities: ["WiFi", "Balcony", "Attached Bath", "Water 24/7"],
    host: {
      name: "Saraswoti Karki",
      phone: "+977 9803112233",
      email: "saraswotik@yahoo.com",
      avatar: IMAGES.avatar2
    },
    reviews: [
      { id: "rev-4-1", reviewerName: "Alisha Thapa", rating: 4.5, text: "Very accommodating host and peaceful neighborhood. Having water 24/7 in Baneshwor is fantastic.", date: "2026-06-18" }
    ],
    dateAdded: "2026-06-10",
    creditsNeeded: 1
  },
  {
    id: "prop-5",
    title: "2BHK Family Apartment Lazimpat",
    description: "A gorgeous, contemporary family apartment with open-plan kitchen, modern dining setup, and secured parking spaces. Safely located in prime Lazimpat, ideal for families or working pairs.",
    price: 45000,
    type: "flat",
    city: "Lazimpat",
    area: "Uttardhoka",
    district: "Kathmandu",
    rating: 4.7,
    verified: true,
    featured: true,
    image: IMAGES.familyAptLazimpat,
    imagesList: [IMAGES.familyAptLazimpat, IMAGES.kitchenCleanApt, IMAGES.bathroomModern, IMAGES.roomCozyNepalese],
    amenities: ["Kitchen", "Parking", "WiFi", "Water 24/7"],
    host: {
      name: "Anil Khadgi",
      phone: "+977 9841662288",
      email: "anil.khadgi@gmail.com",
      avatar: IMAGES.avatar3
    },
    reviews: [],
    dateAdded: "2026-06-11",
    creditsNeeded: 1
  },
  {
    id: "prop-6",
    title: "Spacious Double Room near TU",
    description: "Cozy traditional room styled with Nepalese woven details, offering two comfortable single beds, simple workspace, and shared access. High water accessibility and ideal for roommates.",
    price: 12000,
    type: "room",
    city: "Kirtipur",
    area: "Panga",
    district: "Kathmandu",
    rating: 4.5,
    verified: false,
    featured: false,
    image: IMAGES.roomDoubleTraditional,
    imagesList: [IMAGES.roomDoubleTraditional, IMAGES.bathroomModern],
    amenities: ["WiFi", "Water 24/7", "Attached Bath"],
    host: {
      name: "Bishnu Prasad",
      phone: "+977 9851088998",
      email: "bprasad@wlink.com.np",
      avatar: IMAGES.avatarDefault
    },
    reviews: [],
    dateAdded: "2026-06-14",
    creditsNeeded: 1
  },

  // Hostels
  {
    id: "hostel-1",
    title: "Everest Boys Hostel",
    description: "A premium, safe, and highly interactive boys hostel situated in the heart of Baneshwor, Kathmandu. Known for serving highly nutritional daily meals, outstanding hygiene, laundry facilities, and structured studying tables.",
    price: 8000,
    type: "hostel",
    city: "Baneshwor",
    area: "New Baneshwor",
    district: "Kathmandu",
    rating: 4.7,
    verified: true,
    featured: true,
    image: IMAGES.hostelBoysBaneshwor,
    imagesList: [IMAGES.hostelBoysBaneshwor, IMAGES.roomDoubleTraditional, IMAGES.bathroomModern],
    amenities: ["WiFi", "Mess Included", "Laundry Service", "CCTV Security", "Water 24/7"],
    host: {
      name: "Govinda Adhikari",
      phone: "+977 9841551100",
      email: "everest.boys@gmail.com",
      avatar: IMAGES.avatarDefault
    },
    reviews: [
      { id: "rev-h1-1", reviewerName: "Rohan Tamang", rating: 5, text: "Very friendly warden and superb food. Best place to list for boys studying in Baneshwor.", date: "2026-06-03" }
    ],
    genderSpecific: "boys",
    hostelSeaterOptions: [
      { seater: "1-Seater", price: 15000 },
      { seater: "2-Seater", price: 10000 },
      { seater: "3-Seater", price: 8000 }
    ],
    dateAdded: "2026-05-15",
    creditsNeeded: 1
  },
  {
    id: "hostel-2",
    title: "Annapurna Boys Residence",
    description: "Quiet residential style boys hostel in Putalisadak, Kathmandu. Centrally located with instant access to preparation centers and engineering coaching hubs. Balconies on every tier and round-the-clock water systems.",
    price: 7000,
    type: "hostel",
    city: "Putalisadak",
    area: "Kumari Gulli",
    district: "Kathmandu",
    rating: 4.3,
    verified: true,
    featured: false,
    image: IMAGES.hostelBoysAnnapurna,
    imagesList: [IMAGES.hostelBoysAnnapurna, IMAGES.roomDoubleTraditional],
    amenities: ["WiFi", "Mess Included", "CCTV Security", "Water 24/7"],
    host: {
      name: "Kiran Rimal",
      phone: "+977 9801112288",
      email: "annapurna.residence@yahoo.com",
      avatar: IMAGES.avatar2
    },
    reviews: [],
    genderSpecific: "boys",
    hostelSeaterOptions: [
      { seater: "2-Seater", price: 11000 },
      { seater: "4-Seater", price: 7000 }
    ],
    dateAdded: "2026-06-01",
    creditsNeeded: 1
  },
  {
    id: "hostel-3",
    title: "Shubha Laxmi Girls Hostel",
    description: "Highly secured and welcoming girls hostel located inside the cultural Patan Dhoka area. Provides serene hygiene, standard studies halls, continuous hot water, laundry systems, and delicious household meals.",
    price: 6500,
    type: "hostel",
    city: "Patan",
    area: "Patan Dhoka",
    district: "Lalitpur",
    rating: 4.8,
    verified: true,
    featured: true,
    image: IMAGES.hostelGirlsKitchen,
    imagesList: [IMAGES.hostelGirlsKitchen, IMAGES.kitchenCleanApt, IMAGES.roomCozyNepalese],
    amenities: ["WiFi", "Mess Included", "Laundry Service", "CCTV Security", "Study Hall"],
    host: {
      name: "Laxmi Rajbhandari",
      phone: "+977 9851033221",
      email: "shubhalaxmi.girls@gmail.com",
      avatar: IMAGES.avatar1
    },
    reviews: [
      { id: "rev-h3-1", reviewerName: "Anjali Shrestha", rating: 5, text: "Extremely tidy, super safe, and the food tastes exactly like home. Recommend to everyone!", date: "2026-06-18" }
    ],
    genderSpecific: "girls",
    hostelSeaterOptions: [
      { seater: "1-Seater", price: 14000 },
      { seater: "2-Seater", price: 9500 },
      { seater: "3-Seater", price: 7500 },
      { seater: "4-Seater", price: 6500 }
    ],
    dateAdded: "2026-06-11",
    creditsNeeded: 1
  }
];

export const NEPAL_DISTRICTS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Kaski",
  "Chitwan",
  "Morang",
  "Rupandehi",
  "Sunsari",
  "Jhapa",
  "Makwanpur"
];

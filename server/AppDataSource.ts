import { DataSource } from "typeorm"

export let AppDataSource = new DataSource({
    host: 'localhost',
    port: 1443, //เปลี่ยน port ให้ตรงกับ sqlexpress
    database: 'ssl_project', //เปลี่ยน database
    type: 'mssql',
    entities: ['./entities/*.entity.ts'],
    synchronize: false,
    logging: false,
    username: 'sa', //เปลี่น username
    password: '123456', // password
    options: {
        trustServerCertificate: true
    }
})


AppDataSource.initialize().then((res) => {
    console.log("AppDataSource Initialized")
})
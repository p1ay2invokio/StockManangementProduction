import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Timestamp } from "typeorm";

@Entity({ name: 'dbo.playtwolog' })
export class LogEntity {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'barcode' })
    barcode: string;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'old_qty' })
    old_qty: number

    @Column({ name: 'new_qty' })
    new_qty: number

    @Column({ name: 'timestamp' })
    timestamp: string
}
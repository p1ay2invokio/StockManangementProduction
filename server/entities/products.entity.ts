import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: 'onepointofsale.product' })
export class ProductsEntity {
    @PrimaryColumn({ name: 'Barcode' })
    Barcode: string

    @Column({ name: "Name" })
    Name: string;

    @Column({ name: "Qty" })
    Qty: number;
}
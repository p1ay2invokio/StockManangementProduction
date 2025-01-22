import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'onepointofsale.notificationitem' })
export class NotificationEntity {
    @PrimaryColumn({ name: 'id' })
    id: number

    @Column({ name: 'Message' })
    message: string
}
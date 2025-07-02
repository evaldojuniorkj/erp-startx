import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({nullable: false})

    descricao!: string;
}
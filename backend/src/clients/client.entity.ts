import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: 'FISICA' | 'JURIDICA';

  @Column()
  name!: string;

  @Column({ nullable: true })
  nomeFantasia?: string;

  @Column({ nullable: true, unique: true })
  document?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  // NOVOS CAMPOS
  @Column({ nullable: true })
  inscricaoEstadual?: string;

  @Column({ nullable: true })
  suframa?: string;

  @Column({ nullable: true })
  rg?: string;

  @Column({ nullable: true })
  cep?: string;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  number?: string;

  @Column({ nullable: true })
  neighborhood?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;
}

import { Subject } from "../contracts/Observer/Subject";
import { Repository } from "./Repository";
import { LogToFile } from '../contracts/Logger/LogToFile';
import { PrismaClient } from "@prisma/client";
import { brotliDecompressSync } from "zlib";

const prisma: PrismaClient = new PrismaClient();

export class CategoriesRepository extends Repository implements Subject {
    constructor() {
        super();

        const logToFile = new LogToFile();

        this.attach(logToFile);
    }

    async index() {
        return prisma.categories.findMany()
    }

    async show(category_id: number) {
        return prisma.items.findMany({
            'where': {
                'category_id': category_id
            },
            'include': {
                category: true
            }
        });
    }

    async storeCreate(name: string | undefined, owner: string) {
        await prisma.categories.create({
            data: {
                'name': name,
                'owner': owner
            }
        });
    }

    async storeFindFirst(name: string | undefined) {
        return prisma.categories.findFirst({
            where: {
                'name': name
            }
        });
    }

    async delete(id: number) {
        await prisma.categories.delete({
            where: {
                id: id
            }
        });
    }

    async deleteUpdateItems(category_id: number) {
        await prisma.items.updateMany({
            where: { 'category_id': category_id },
            data: { 'category_id': 1 }
        });
    }

    async edit(id: number) {
        return prisma.categories.findFirst({
            where: {
                id: id
            }
        })
    }

    async update(body: any) {
        await prisma.categories.update({
            where: {
                id: Number(body.id)
            },
            data: {
                name: body.name
            }
        });
    }


    //logs
    log(message: string) {
        this.observers.forEach(observer => {
            observer.setMessage(message);
        });

        super.notify();
    }

    storeLog(username: string | undefined, name: string) {
        this.log(`${username} add category name=${name}`)
    }

    deleteLog(username: string, id: number) {
        this.log(`user ${username} deleted category id=${id}`)
    }

    updateLog(username: string, id: number) {
        this.log(`user ${username} updated category id=${id}`);
    }
}
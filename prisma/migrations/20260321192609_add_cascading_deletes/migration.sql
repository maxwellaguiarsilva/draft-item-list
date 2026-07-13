-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_listId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_groupId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_listId_fkey";

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE CASCADE ON UPDATE CASCADE;

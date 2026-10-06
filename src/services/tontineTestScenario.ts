import { tontineService } from './tontineService';
import { productService } from './productService';
import { Product } from '../types';

export const tontineTestScenario = {
  /**
   * Generates a complete 10-member test group simulating:
   * 1. 10 unique positions (1 Jean, 2 Awa, 3 Koffi, 4 Mariam, 5 Paul, 6 Grâce, 7 Serge, 8 Fatou, 9 Yao, 10 Alain)
   * 2. Distinct products per member
   * 3. Rotations & schedule
   * 4. Multiples contributions (daily, grouped, late)
   * 5. Current and next beneficiary
   * 6. Delivery process for completed beneficiary
   */
  async runTenMembersScenario(): Promise<string> {
    const products = await productService.getProducts();
    const fallbackProduct: Product = products[0] || {
      id: 'default-prod',
      name: 'Smart TV Samsung 55 UHD 4K',
      brand: 'Samsung',
      reference: 'PG-TV-55-4K',
      category: 'tv-audio',
      categoryName: 'Téléviseurs',
      price: 240000,
      priceCash: 240000,
      priceTontine: 240000,
      isTontineEligible: true,
      inStock: true,
      images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80'],
      description: 'TV 4K Ultra HD',
      commercialMode: 'all',
      warrantyMonths: 24,
      createdAt: new Date().toISOString(),
    };

    // 1. Create a fresh group with stable ID
    const group = await tontineService.createTontineGroup({
      name: 'Tontine Électroménager Élite PENTA #10',
      description: 'Groupe pilote de 10 personnes avec rotation de 10 jours et cycle global de 110 jours.',
      memberCount: 10,
      rotationPeriodDays: 10,
      totalDurationDays: 110,
      contributionFrequency: 'daily',
      startDate: new Date().toISOString(),
      allowCustomProducts: true,
    });

    const membersData = [
      { name: 'Jean Kouassi', phone: '+225 07 01 02 03 04', commune: 'Cocody Angré' },
      { name: 'Awa Traoré', phone: '+225 07 11 22 33 44', commune: 'Yopougon Maroc' },
      { name: 'Koffi Konan', phone: '+225 05 55 66 77 88', commune: 'Marcory Zone 4' },
      { name: 'Mariam Bamba', phone: '+225 07 44 55 66 77', commune: 'Plateau Dokui' },
      { name: 'Paul N\'Guessan', phone: '+225 01 02 03 04 05', commune: 'Koumassi Remblais' },
      { name: 'Grâce Kindo', phone: '+225 07 99 88 77 66', commune: 'Riviera Palmeraie' },
      { name: 'Serge Diomandé', phone: '+225 05 12 34 56 78', commune: 'Cocody Attoban' },
      { name: 'Fatou Cissé', phone: '+225 07 23 45 67 89', commune: 'Treichville Arras' },
      { name: 'Yao Sylvain', phone: '+225 01 98 76 54 32', commune: 'Abobo Baoulé' },
      { name: 'Alain Dago', phone: '+225 05 87 65 43 21', commune: 'Bingerville Cité' },
    ];

    // 2. Add all 10 members with unique positions 1..10
    const createdMembers = [];
    for (let i = 0; i < 10; i++) {
      const pos = i + 1;
      const memInfo = membersData[i];
      // Select product (use varied products from catalog if available)
      const assignedProduct = products[i % products.length] || fallbackProduct;

      const mem = await tontineService.addMemberToGroup({
        groupId: group.id,
        customerId: `cust-tontine-${pos}-${Date.now()}`,
        customerName: memInfo.name,
        customerPhone: memInfo.phone,
        position: pos,
        product: assignedProduct,
        deliveryCommune: memInfo.commune,
        deliveryAddress: `${memInfo.commune}, Rue Résidentielle`,
      });
      createdMembers.push(mem);
    }

    // 3. Record realistic contributions
    // Member 1 (Jean): Fully paid & beneficiary
    await tontineService.recordContribution({
      groupId: group.id,
      memberId: createdMembers[0].id,
      customerId: createdMembers[0].customerId,
      amount: createdMembers[0].expectedContribution,
      method: 'wave',
      paymentType: 'grouped',
      reference: `WAVE-TNT-${Date.now().toString().slice(-6)}`,
      recordedBy: 'admin',
      notes: 'Cotisation intégrale soldée pour Tour #1',
    });
    // Trigger delivery for Member 1
    await tontineService.updateMemberDeliveryStatus(createdMembers[0].id, 'shipped');

    // Member 2 (Awa - Next beneficiary): 70% paid
    const amountAwa = Math.round(createdMembers[1].expectedContribution * 0.7);
    await tontineService.recordContribution({
      groupId: group.id,
      memberId: createdMembers[1].id,
      customerId: createdMembers[1].customerId,
      amount: amountAwa,
      method: 'orange_money',
      paymentType: 'daily',
      reference: `OM-TNT-${Date.now().toString().slice(-6)}`,
      recordedBy: 'client',
      notes: 'Versements journaliers réguliers',
    });

    // Members 3 to 10: Initial daily contributions
    for (let i = 2; i < 10; i++) {
      const dailyAmt = createdMembers[i].dailyAmount || 1500;
      await tontineService.recordContribution({
        groupId: group.id,
        memberId: createdMembers[i].id,
        customerId: createdMembers[i].customerId,
        amount: dailyAmt * 5, // 5 days cotisés
        method: 'mtn_momo',
        paymentType: 'daily',
        reference: `MOMO-TNT-${Date.now().toString().slice(-6)}-${i}`,
        recordedBy: 'client',
      });
    }

    // Activate group
    await tontineService.setGroupRotationPosition(group.id, 1);

    return group.groupCode;
  }
};

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { data, format } = await request.json();
    
    let contacts: any[] = [];
    
    if (format === 'csv') {
      // Parse CSV: nome,telefone,cidade
      const lines = data.split('\n').filter((line: string) => line.trim());
      const headers = lines[0].toLowerCase().split(',').map((h: string) => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v: string) => v.trim());
        if (values.length >= headers.length) {
          const contact: any = {};
          
          headers.forEach((header: string, index: number) => {
            if (header.includes('nome')) contact.name = values[index];
            if (header.includes('telefone') || header.includes('phone')) {
              contact.phone = values[index].replace(/\D/g, ''); // Remove caracteres especiais
            }
            if (header.includes('cidade')) contact.city = values[index];
            if (header.includes('email')) contact.email = values[index];
          });
          
          // Validar telefone
          if (contact.phone && contact.phone.length >= 10) {
            contacts.push(contact);
          }
        }
      }
    } else if (format === 'txt') {
      // Parse TXT: um número por linha
      const lines = data.split('\n').filter((line: string) => line.trim());
      
      lines.forEach((line: string, index: number) => {
        const phone = line.trim().replace(/\D/g, '');
        if (phone.length >= 10) {
          contacts.push({
            name: `Contato ${index + 1}`,
            phone: phone
          });
        }
      });
    } else if (format === 'json') {
      // Parse JSON
      try {
        const jsonData = JSON.parse(data);
        if (Array.isArray(jsonData)) {
          contacts = jsonData.filter(contact => 
            contact.phone && contact.phone.toString().replace(/\D/g, '').length >= 10
          ).map(contact => ({
            name: contact.name || contact.nome || `Contato`,
            phone: contact.phone.toString().replace(/\D/g, ''),
            email: contact.email,
            city: contact.city || contact.cidade
          }));
        }
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: 'JSON inválido'
        }, { status: 400 });
      }
    }

    // Remover duplicatas por telefone
    const uniqueContacts = contacts.filter((contact, index, self) =>
      index === self.findIndex(c => c.phone === contact.phone)
    );

    // Validações finais
    const validContacts = uniqueContacts.filter(contact => {
      const phone = contact.phone;
      // Telefone brasileiro: 10-11 dígitos
      return phone && phone.length >= 10 && phone.length <= 11;
    });

    return NextResponse.json({
      success: true,
      contacts: validContacts,
      summary: {
        total: validContacts.length,
        duplicatesRemoved: uniqueContacts.length - validContacts.length,
        invalid: contacts.length - validContacts.length
      }
    });

  } catch (error) {
    console.error('Erro ao processar contatos:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar arquivo de contatos'
    }, { status: 500 });
  }
}
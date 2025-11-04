// utils/notifications.ts
export const sendDiscordNotification = async (bugReport: any) => {
  const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_REPORT_SERVER;
  
  try {
    const embed = {
      title: "🐛 Nuevo Bug Reportado",
      color: 0xff0000, // Color rojo
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "👤 Usuario",
          value: `${bugReport.userName}\n${bugReport.userEmail}`,
          inline: true
        },
        {
          name: "📍 Ubicación",
          value: `Segmento: ${bugReport.currentState.segment}\nURL: ${bugReport.url}`,
          inline: true
        },
        {
          name: "📝 Descripción",
          value: bugReport.message.length > 1000 
            ? bugReport.message.substring(0, 1000) + "..." 
            : bugReport.message,
          inline: false
        },
        {
          name: "🔧 Info Técnica",
          value: `Navegador: ${bugReport.userAgent.split(' ')[0]}\nFecha: ${new Date().toLocaleString('es-CO')}`,
          inline: false
        }
      ],
      footer: {
        text: "Sistema de Reportes SKH",
        icon_url: "https://your-domain.com/assets/logo_skh.webp" // Opcional
      }
    };

    // Si hay productos seleccionados, agregar esa info
    if (bugReport.currentState.selectedProducts?.length > 0) {
      embed.fields.push({
        name: "🛍️ Productos Seleccionados",
        value: bugReport.currentState.selectedProducts
          .slice(0, 5) // Máximo 5 productos para no saturar
          .map((p: any) => `• ${p.name || p.title || 'Producto'}`)
          .join('\n') + 
          (bugReport.currentState.selectedProducts.length > 5 ? '\n• Y más...' : ''),
        inline: false
      });
    }

    const payload = {
      embeds: [embed],
      username: "Bug Reporter", // Nombre del bot
      avatar_url: "https://cdn.discordapp.com/emojis/🐛.png" // Opcional
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('Discord notification sent successfully');
    } else {
      throw new Error(`Discord API error: ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error sending Discord notification:', error);
    // Opcional: fallback a otro método de notificación
  }
};

// utils/notifications.ts
export const sendAdvancedDiscordNotification = async (bugReport: any) => {
  const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_REPORT_SERVER;
  try {
    // Crear un ID único para el reporte
    const reportId = `bug_${bugReport.firestoreId || Date.now()}`;
    const segment = bugReport.currentState.segment === 'quote' ? 'Cotizador' : 'Formulador';
    
    const embed = {
      title: "🐛 Nuevo Bug Reportado",
      description: `**ID del Reporte:** \`${reportId}\``,
      color: 0xff4757, // Color rojo más moderno
      timestamp: new Date().toISOString(),
      thumbnail: {
        url: "https://cdn.discordapp.com/emojis/🐛.png"
      },
      fields: [
        {
          name: "👤 Información del Usuario",
          value: `**Nombre:** ${bugReport.userName}\n**Email:** ${bugReport.userEmail}\n**ID:** \`${bugReport.userId}\``,
          inline: true
        },
        {
          name: "📍 Contexto de la Aplicación",
          value: `**Segmento:** ${bugReport.currentState.segment}\n**Kit:** ${bugReport.currentState.kit || 'N/A'}`,
          inline: true
        },
        {
          name: "📝 Descripción del Bug",
          value: bugReport.message.length > 800 
            ? bugReport.message.substring(0, 800) + "..." 
            : bugReport.message,
          inline: false
        }
      ],
      footer: {
        text: `Sistema SKH • ${new Date().toLocaleString('es-CO', { 
          timeZone: 'America/Bogota' 
        })}`,
        icon_url: "https://miasistente.skhcolombia.co/_next/image?url=%2Fassets%2Flogo_skh.webp&w=128&q=75"
      }
    };

    // Agregar productos si existen
    if (bugReport.currentState.products?.length > 0) {
      const products = bugReport.currentState.products;
      const productList = products
        .slice(0, 5)
        .map((p: any, i: number) => `${i + 1}. ${p.code} - ${p.name || p.title || 'Producto sin nombre'}`)
        .join('\n');
      
      embed.fields.push({
        name: `🛍️ Productos (${products.length})`,
        value: productList + (products.length > 3 ? `\n... y ${products.length - 3} más` : ''),
        inline: true
      });
    }

    // Información técnica adicional
    const browserInfo = bugReport.userAgent.match(/Chrome\/[\d.]+|Firefox\/[\d.]+|Safari\/[\d.]+|Edge\/[\d.]+/)?.[0] || 'Desconocido';
    embed.fields.push({
      name: "🔧 Información Técnica",
      value: `**Navegador:** ${browserInfo}\n**Plataforma:** ${navigator.platform || 'Desconocida'}\n**Resolución:** ${screen.width}x${screen.height}`,
      inline: false
    });

    const payload = {
      embeds: [embed],
      username: "SKH Bug Reporter",
      avatar_url: "https://your-domain.com/favicon.ico"
    };

    if (!DISCORD_WEBHOOK_URL) {
      throw new Error('Discord webhook URL is not defined');
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }
    return { success: true, reportId };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};
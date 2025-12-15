document.addEventListener('DOMContentLoaded', () => {
    const shareButtons = document.querySelectorAll('.share-btn');

    shareButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Empêche le lien de la carte de s'activer
            event.preventDefault();
            event.stopPropagation();

            const network = button.dataset.network;
            const url = window.location.origin + button.dataset.url;
            const title = button.dataset.title || document.title;

            switch (network) {
                case 'facebook':
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                    break;
                case 'twitter':
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400');
                    break;
                case 'whatsapp':
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title)} ${encodeURIComponent(url)}`, '_blank');
                    break;
                case 'copy':
                    navigator.clipboard.writeText(url).then(() => {
                        showToast('Lien copié dans le presse-papiers !');
                    }).catch(err => {
                        console.error('Erreur lors de la copie du lien :', err);
                        showToast('Erreur lors de la copie', 'error');
                    });
                    break;
            }
        });
    });

    function showToast(message, type = 'success') {
        // Supprime les anciens toasts pour éviter la superposition
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        
        // Style du toast
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.color = 'white';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease, bottom 0.3s ease';
        
        if (type === 'success') {
            toast.style.backgroundColor = '#28a745'; // Vert
        } else {
            toast.style.backgroundColor = '#dc3545'; // Rouge
        }

        document.body.appendChild(toast);

        // Animation d'apparition
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.bottom = '30px';
        }, 10);

        // Disparition automatique après 3 secondes
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.bottom = '20px';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});

import re

with open('src/pages/BuyerDashboard.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_until = -1
for i, line in enumerate(lines):
    if i < skip_until:
        continue
    
    if 'supabase.auth.getSession().then(' in line:
        new_lines.append('      navigate("/signin");\n')
        skip_until = i + 9
        continue
        
    if 'const { data: { subscription } } = supabase.auth.onAuthStateChange' in line:
        skip_until = i + 8
        continue
        
    if 'const { error: uploadError } = await supabase.storage' in line and 'avatars' in lines[i+1]:
        if 'avatar_url' in ''.join(lines[i:i+10]):
            new_lines.append('    const publicUrl = URL.createObjectURL(file);\n')
            new_lines.append('    toast.success("Avatar upload simulated");\n')
            skip_until = i + 9
            continue
        elif 'id_card_url' in ''.join(lines[i:i+10]):
            new_lines.append('    const publicUrl = URL.createObjectURL(file);\n')
            new_lines.append('    toast.success("ID Card upload simulated");\n')
            skip_until = i + 9
            continue

    if 'const { error } = await supabase' in line and '.from("profiles")' in lines[i+1]:
        new_lines.append('    toast.success("Profile updated (simulated)");\n')
        new_lines.append('    const error = null;\n')
        skip_until = i + 9
        continue
        
    if 'const { error } = await supabase' in line and '.from("orders")' in lines[i+1]:
        new_lines.append('        toast.success("Order placed (simulated)");\n')
        new_lines.append('        const error = null;\n')
        skip_until = i + 11
        continue
        
    if 'await supabase.from("notifications").insert({' in line:
        skip_until = i + 6
        continue
        
    if 'await supabase.from("wallets").update(' in line:
        continue
        
    if 'const { error } = await supabase.from("cards").insert({' in line:
        new_lines.append('    const error = null;\n')
        skip_until = i + 8
        continue
        
    if 'supabase.auth.signOut().then(() => navigate("/signin"));' in line:
        new_lines.append('                  localStorage.removeItem("camemark_token"); localStorage.removeItem("camemark_user"); navigate("/signin");\n')
        continue
        
    if 'supabase.auth.signOut().then(() => navigate("/"));' in line:
        new_lines.append('                  localStorage.removeItem("camemark_token"); localStorage.removeItem("camemark_user"); navigate("/");\n')
        continue
        
    new_lines.append(line)

with open('src/pages/BuyerDashboard.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
